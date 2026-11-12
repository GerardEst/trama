import type { Color, PlaneGeometry, ShaderMaterial, Texture, WebGLRenderTarget, WebGLRenderer } from 'three'

interface Passage {
  name: string
  text: string
  answers: string[]
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.07; a *= 0.5; }
    return v;
  }
`

// The tear. The mask holds two things: in red, how close each point is to the
// line of a tear (1 on the line, 0 at its reach); in green, the tear's life.
// Each frame life runs down, and the pointer tears one more piece, from where
// the tip was to where it is now. The line wanders and changes width as it
// goes, like paper that gives where it is weakest. A fresh tear starts its life
// at 1.6; tearing again where one is already open keeps it open.
const TEAR = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrevious;
  uniform vec2 uSize;
  uniform vec2 uFrom;
  uniform vec2 uTo;
  uniform float uRadiusFrom;
  uniform float uRadiusTo;
  uniform float uTravelled;
  uniform float uSeed;
  uniform float uAging;
  uniform float uTearing;
  uniform vec4 uQuiet;
  ${NOISE}

  // 1 over the quiet words (left, bottom, right, top), fading out around them.
  float quietness(vec2 p) {
    vec2 centre = (uQuiet.xy + uQuiet.zw) * 0.5;
    vec2 d = abs(p - centre) - (uQuiet.zw - uQuiet.xy) * 0.5;
    float outside = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    return 1.0 - smoothstep(0.0, 48.0, outside);
  }

  void main() {
    vec4 previous = texture2D(uPrevious, vUv);
    float life = max(previous.g - uAging, 0.0);
    float line = life > 0.0 ? previous.r : 0.0;
    if (uTearing > 0.5) {
      vec2 p = vUv * uSize;
      vec2 segment = uTo - uFrom;
      float length_ = max(length(segment), 0.001);
      vec2 along = segment / length_;
      vec2 across = vec2(-along.y, along.x);
      float t = clamp(dot(p - uFrom, along) / length_, 0.0, 1.0);
      float run = uTravelled + t * length_;
      float radius = mix(uRadiusFrom, uRadiusTo, t) * (0.6 + 0.8 * noise(vec2(run / 70.0, uSeed + 7.0)));
      float wander = (noise(vec2(run / 45.0, uSeed)) - 0.5) * radius * 0.7;
      float distance_ = length(p - (uFrom + along * t * length_) - across * wander);
      // The paper does not tear across the quiet words: the tear thins out and stops.
      float reach = clamp(1.0 - distance_ / radius, 0.0, 1.0) * (1.0 - quietness(p));
      if (reach > 0.0) {
        line = max(line, reach);
        life = life > 0.0 ? max(life, 1.0) : 1.6;
      }
    }
    gl_FragColor = vec4(line, life, 0.0, 1.0);
  }
`

// The page. A tear opens just after it is made, stays open, and closes again
// as its life runs out. Its edge is jagged at two scales; around it, a fringe of
// the paper's white fibres, and each side of the painting pulled a little away
// from the line. Through the opening, the words, each letter in a deeper tone of
// the landscape above it, the pilcrows and arrows in the cape's red; the torn
// edge casts a shadow on them, more from the upper side. The paper beneath is
// the page's own, so on a dark page the words are light.
const PAGE = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform sampler2D uMask;
  uniform sampler2D uWords;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform vec2 uMaskTexel;
  uniform vec3 uGraphite;
  uniform vec3 uCape;
  uniform vec3 uPaper;
  uniform float uDark;
  ${NOISE}

  // object-fit: cover, anchored to the bottom like the <img>.
  vec2 cover(vec2 uv) {
    float screen = uResolution.x / uResolution.y;
    float picture = uImageSize.x / uImageSize.y;
    vec2 scale = screen > picture ? vec2(1.0, picture / screen) : vec2(screen / picture, 1.0);
    return vec2((uv.x - 0.5) * scale.x + 0.5, uv.y * scale.y);
  }

  void main() {
    vec2 pixel = vUv * uResolution;
    vec4 tear = texture2D(uMask, vUv);
    float opened = smoothstep(1.6, 1.48, tear.g) * smoothstep(0.0, 0.7, tear.g);

    // Towards the line of the tear; each side of the painting moves away from it.
    vec2 e = uMaskTexel * 1.5;
    vec2 toward = vec2(
      texture2D(uMask, vUv + vec2(e.x, 0.0)).r - texture2D(uMask, vUv - vec2(e.x, 0.0)).r,
      texture2D(uMask, vUv + vec2(0.0, e.y)).r - texture2D(uMask, vUv - vec2(0.0, e.y)).r
    );
    toward = length(toward) > 0.0001 ? normalize(toward) : vec2(0.0);
    float pull = opened * smoothstep(0.0, 0.45, tear.r) * 9.0;
    vec3 paint = texture2D(uImage, cover(vUv + toward * pull / uResolution)).rgb;

    // The jagged edge, and the fringe of fibres, wider in some places than others
    // and on the lower side, where the paper's top layer peeled back as it tore.
    float upper = 0.5 + 0.5 * dot(toward, normalize(vec2(0.3, -1.0)));
    float field = tear.r + (fbm(pixel / 8.0) - 0.5) * 0.24 + (noise(pixel / 2.4) - 0.5) * 0.07;
    float edge = 1.0 - opened * 0.74;
    float open = smoothstep(edge, edge + 0.012, field) * step(0.02, opened);
    float fringe = (0.05 + 0.1 * noise(pixel / 16.0)) * opened * mix(1.5, 0.35, upper);
    float fibres = smoothstep(edge - fringe - 0.012, edge - fringe, field + (noise(pixel / 1.2) - 0.5) * 0.06) * (1.0 - open);
    vec3 fibre = mix(vec3(0.99, 0.98, 0.95), vec3(0.88, 0.86, 0.81), noise(pixel / 1.6) * 0.7);
    float lip = smoothstep(edge - fringe - 0.12, edge - fringe - 0.02, field) * (1.0 - fibres) * (1.0 - open) * opened;

    // Beneath: the words, with a trace of the landscape on their paper.
    vec3 words = texture2D(uWords, vUv).rgb;
    vec3 paper = mix(uPaper, paint, 0.12 * (1.0 - uDark * 0.4));
    vec3 ink = mix(mix(paint * paint * 0.7, uGraphite, 0.3), mix(sqrt(paint), vec3(0.95, 0.93, 0.89), 0.35), uDark);
    vec3 under = mix(paper, ink, words.r);
    under = mix(under, uCape, words.g);
    float depth = 1.0 - smoothstep(0.0, 0.16, field - edge);
    under *= 1.0 - depth * mix(0.12, 0.38, upper);

    vec3 color = paint * (1.0 - lip * 0.14);
    color = mix(color, fibre, fibres);
    color = mix(color, under, open);
    gl_FragColor = vec4(color, 1.0);
  }
`

const LIFE_PER_SECOND = 0.32
const LONGEST_TEAR = 1.6 / LIFE_PER_SECOND + 0.5
// The mask is kept at half the element's size: the edge's detail is drawn by the page.
const MASK_SCALE = 0.5

class WrittenWorldEffect {
  private destroyed = false
  private painting?: Texture
  private geometry?: PlaneGeometry

  private renderer?: WebGLRenderer
  private page?: ShaderMaterial
  private tearing?: ShaderMaterial
  private targets: WebGLRenderTarget[] = []
  private words?: Texture
  private renderPage = () => {}
  private renderTear = (_target: WebGLRenderTarget) => {}
  private makeTargets = (_width: number, _height: number) => {}
  private observer?: IntersectionObserver
  private resizer?: ResizeObserver
  private surface: HTMLElement | null = null
  private visible = false
  private started = false
  private frame = 0
  private last = 0
  private lastTear = -Infinity
  private size = { width: 1, height: 1 }
  // Where the pointer is, and where the tear's tip is: the tip follows a little
  // behind, which smooths the tear into curves.
  private pointer: { x: number; y: number } | null = null
  private tip: { x: number; y: number } | null = null
  private radius = 0
  private travelled = 0
  private seed = 0
  private intro?: { started: number; points: [number, number][] }
  private resizeTimer = 0
  private family = 'serif'
  private readColors = () => {}

  constructor(private readonly host: HTMLElement) {}

  connect() {
    this.surface = this.host.parentElement
    this.observer = new IntersectionObserver(entries => {
      if (this.destroyed) return
      this.visible = entries.some(entry => entry.isIntersecting)
      if (this.visible && !this.started) {
        this.started = true
        void this.start()
      }
      if (this.visible) this.listen()
      else this.unlisten()
    })
    this.observer.observe(this.host)
  }

  destroy() {
    this.destroyed = true
    this.observer?.disconnect()
    this.resizer?.disconnect()
    this.unlisten()
    cancelAnimationFrame(this.frame)
    clearTimeout(this.resizeTimer)
    this.targets.forEach(target => target.dispose())
    this.words?.dispose()
    this.page?.dispose()
    this.tearing?.dispose()
    this.painting?.dispose()
    this.geometry?.dispose()
    this.renderer?.dispose()
    this.host.removeAttribute('data-written')
  }

  private async start() {
    const canvas = this.host.querySelector('canvas')!
    const image = this.host.querySelector('img')!
    const three = await import('three')
    if (this.destroyed) return
    // The painting's colours go to the screen exactly as they are in the file.
    three.ColorManagement.enabled = false
    let renderer: WebGLRenderer
    try {
      renderer = new three.WebGLRenderer({ canvas, antialias: false, alpha: false })
    } catch {
      return
    }
    this.renderer = renderer
    // The <img> has already chosen and loaded the right size; the texture reuses it.
    const painting = await new three.TextureLoader().loadAsync(image.currentSrc || image.src).catch(() => null)
    if (!painting) return renderer.dispose()
    if (this.destroyed) return painting.dispose()
    this.painting = painting
    painting.generateMipmaps = false
    painting.minFilter = three.LinearFilter

    this.family = getComputedStyle(this.surface?.querySelector('h1') ?? this.host).fontFamily
    await document.fonts.load(`16px ${this.family}`).catch(() => [])
    await document.fonts.load(`italic 16px ${this.family}`).catch(() => [])

    if (this.destroyed) return

    const camera = new three.Camera()
    const quad = new three.PlaneGeometry(2, 2)
    this.geometry = quad
    const pageScene = new three.Scene()
    const tearScene = new three.Scene()
    this.page = new three.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: PAGE,
      uniforms: {
        uImage: { value: painting },
        uMask: { value: null },
        uWords: { value: null },
        uResolution: { value: new three.Vector2(1, 1) },
        uImageSize: { value: new three.Vector2(painting.image.width, painting.image.height) },
        uMaskTexel: { value: new three.Vector2(1, 1) },
        uGraphite: { value: new three.Color() },
        uCape: { value: new three.Color() },
        uPaper: { value: new three.Color() },
        uDark: { value: 0 },
      },
    })
    this.tearing = new three.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: TEAR,
      uniforms: {
        uPrevious: { value: null },
        uSize: { value: new three.Vector2(1, 1) },
        uFrom: { value: new three.Vector2() },
        uTo: { value: new three.Vector2() },
        uRadiusFrom: { value: 1 },
        uRadiusTo: { value: 1 },
        uTravelled: { value: 0 },
        uSeed: { value: 0 },
        uAging: { value: 0 },
        uTearing: { value: 0 },
        uQuiet: { value: new three.Vector4(-1e5, -1e5, -1e5, -1e5) },
      },
    })
    pageScene.add(new three.Mesh(quad, this.page))
    tearScene.add(new three.Mesh(quad, this.tearing))

    // Half floats keep the tear's life in small steps; without them it runs down
    // in coarser ones, which still reads well.
    const type = renderer.capabilities.isWebGL2 ? three.HalfFloatType : three.UnsignedByteType
    this.makeTargets = (width, height) => {
      this.targets.forEach(target => target.dispose())
      this.targets = [0, 1].map(() => new three.WebGLRenderTarget(width, height, {
        type,
        depthBuffer: false,
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
      }))
      for (const target of this.targets) {
        renderer.setRenderTarget(target)
        renderer.clear()
      }
      renderer.setRenderTarget(null)
    }
    this.renderTear = target => {
      renderer.setRenderTarget(target)
      renderer.render(tearScene, camera)
      renderer.setRenderTarget(null)
    }
    this.renderPage = () => renderer.render(pageScene, camera)
    // The theme can change while the page is open, so each tear reads the
    // colours again: the cape and graphite (set on this element) and the paper.
    this.readColors = () => {
      const uniforms = this.page!.uniforms
      const style = getComputedStyle(this.host)
      const paper = (uniforms['uPaper']!.value as Color).setStyle(getComputedStyle(document.body).backgroundColor)
      uniforms['uCape']!.value.setStyle(style.color)
      uniforms['uGraphite']!.value.setStyle(style.outlineColor)
      uniforms['uDark']!.value = paper.r * 0.3 + paper.g * 0.59 + paper.b * 0.11 < 0.5 ? 1 : 0
    }
    this.readColors()
    this.makeWords = (width, height, ratio) => {
      const texture = new three.CanvasTexture(this.typeset(width, height, ratio))
      texture.generateMipmaps = false
      texture.minFilter = three.LinearFilter
      return texture
    }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 1)
    this.resizer = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = window.setTimeout(() => this.resize(), 120)
    })
    this.resizer.observe(this.host)
    this.resize()
    this.host.setAttribute('data-written', '')
    this.playIntro()
  }

  // Where the quiet words are, in the tear's coordinates (origin bottom left).
  private measureQuiet() {
    const selector = this.host.dataset['quiet']
    const quiet = selector ? this.surface?.querySelector(selector) : null
    if (!quiet || !this.tearing) return
    const own = this.host.getBoundingClientRect()
    const rect = quiet.getBoundingClientRect()
    this.tearing.uniforms['uQuiet']!.value.set(rect.left - own.left, own.bottom - rect.bottom, rect.right - own.left, own.bottom - rect.top)
  }

  private makeWords = (_width: number, _height: number, _ratio: number): Texture | undefined => undefined

  private resize() {
    if (!this.renderer || !this.page || !this.tearing) return
    const { width, height } = this.host.getBoundingClientRect()
    if (!width || !height) return
    this.size = { width, height }
    this.renderer.setSize(width, height, false)
    this.makeTargets(Math.ceil(width * MASK_SCALE), Math.ceil(height * MASK_SCALE))
    this.words?.dispose()
    this.words = this.makeWords(width, height, this.renderer.getPixelRatio())
    this.page.uniforms['uResolution']!.value.set(width, height)
    this.page.uniforms['uMaskTexel']!.value.set(1 / Math.ceil(width * MASK_SCALE), 1 / Math.ceil(height * MASK_SCALE))
    this.page.uniforms['uWords']!.value = this.words
    this.page.uniforms['uMask']!.value = this.targets[0]!.texture
    this.tearing.uniforms['uSize']!.value.set(width, height)
    this.measureQuiet()
    this.renderPage()
  }

  // The words beneath: the example story, set as one long justified page. The
  // lines grow from the top of the valley to its foot, so the letters keep the
  // painting's depth. Body text goes in the red channel, the marks in green.
  private typeset(width: number, height: number, ratio: number) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    const context = canvas.getContext('2d')!
    context.scale(ratio, ratio)
    context.fillStyle = '#000'
    context.fillRect(0, 0, width, height)
    context.textBaseline = 'alphabetic'

    const passages = JSON.parse(this.host.dataset['passages'] ?? '[]') as Passage[]
    type Word = { text: string; italic?: boolean; mark?: boolean }
    const words: Word[] = passages.flatMap(passage => [
      ...passage.name.split(' ').map(text => ({ text, italic: true })),
      { text: '—', italic: true },
      ...passage.text.split(' ').map(text => ({ text })),
      ...passage.answers.flatMap(answer => [{ text: '→', mark: true }, ...answer.split(' ').map(text => ({ text, italic: true }))]),
      { text: '¶', mark: true },
    ])
    if (!words.length) return canvas

    const margin = 8
    // Narrow screens set the same page a little smaller.
    const scale = Math.min(1, Math.max(0.72, width / 1440))
    let next = 0
    let y = 0
    while (y < height + 20) {
      const depth = Math.min(1, y / height)
      const size = (12 + 12 * depth ** 1.6) * scale
      y += size * 1.18
      const regular = `${size}px ${this.family}`
      const italic = `italic ${size}px ${this.family}`
      const space = size * 0.27
      const line: { word: Word; width: number }[] = []
      let used = 0
      while (true) {
        const word = words[next % words.length]!
        context.font = word.italic ? italic : regular
        const wordWidth = context.measureText(word.text).width
        if (line.length && used + space + wordWidth > width - margin * 2) break
        used += (line.length ? space : 0) + wordWidth
        line.push({ word, width: wordWidth })
        next++
      }
      const gap = line.length > 1 ? space + (width - margin * 2 - used) / (line.length - 1) : 0
      let x = margin
      for (const { word, width: wordWidth } of line) {
        context.font = word.italic ? italic : regular
        context.fillStyle = word.mark ? '#00ff00' : '#ff0000'
        context.fillText(word.text, x, y)
        x += wordWidth + gap
      }
    }
    return canvas
  }

  private listen() {
    this.surface?.addEventListener('pointermove', this.onMove, { passive: true })
    this.surface?.addEventListener('pointerleave', this.onLeave, { passive: true })
  }

  private unlisten() {
    this.surface?.removeEventListener('pointermove', this.onMove)
    this.surface?.removeEventListener('pointerleave', this.onLeave)
  }

  // Mouse and pen only: on touch the same gesture scrolls the page.
  private onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !this.renderer) return
    const rect = this.host.getBoundingClientRect()
    const point = { x: event.clientX - rect.left, y: rect.bottom - event.clientY }
    if (point.x < 0 || point.y < 0 || point.x > rect.width || point.y > rect.height) return this.onLeave()
    this.intro = undefined
    this.aim(point)
  }

  private onLeave = () => {
    this.pointer = null
    this.tip = null
  }

  private aim(point: { x: number; y: number }) {
    if (!this.pointer) {
      // A new tear starts where the pointer is, with its own way of wandering.
      this.tip = { ...point }
      this.radius = 0
      this.travelled = 0
      this.seed = Math.random() * 100
      this.readColors()
      this.measureQuiet()
    }
    this.pointer = point
    this.wake()
  }

  // The first pointer interaction reveals how the valley can be torn.
  private playIntro() {
    const { width, height } = this.size
    // Wide, beside the title on the left hillside; narrow, across the strip of
    // valley between the title and the story.
    const points: [number, number][] = width >= 900
      ? [[0.03, 0.5], [0.11, 0.45], [0.19, 0.5], [0.28, 0.43]]
      : [[0.04, 0.22], [0.3, 0.28], [0.62, 0.22], [0.96, 0.29]]
    this.intro = { started: performance.now() + 700, points: points.map(([x, y]) => [x * width, y * height]) }
    this.wake()
  }

  private wake() {
    if (this.frame || !this.visible) return
    this.last = performance.now()
    this.frame = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    this.frame = 0
    if (!this.renderer || !this.tearing || !this.page) return
    // The frame's timestamp can be a little older than the moment it was asked for.
    const seconds = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
    this.last = now

    if (this.intro && now >= this.intro.started) {
      const progress = (now - this.intro.started) / 1400
      if (progress > 1) {
        this.intro = undefined
        this.onLeave()
      } else {
        const { points } = this.intro
        const eased = 1 - (1 - progress) ** 2
        const at = eased * (points.length - 1)
        const index = Math.min(points.length - 2, Math.floor(at))
        const [ax, ay] = points[index]!
        const [bx, by] = points[index + 1]!
        const local = at - index
        this.aim({ x: ax + (bx - ax) * local, y: ay + (by - ay) * local })
      }
    }

    const uniforms = this.tearing.uniforms
    uniforms['uAging']!.value = seconds * LIFE_PER_SECOND
    uniforms['uTearing']!.value = 0
    if (this.pointer && this.tip) {
      const from = { ...this.tip }
      const follow = 1 - Math.pow(0.0005, seconds)
      this.tip.x += (this.pointer.x - this.tip.x) * follow
      this.tip.y += (this.pointer.y - this.tip.y) * follow
      const moved = Math.hypot(this.tip.x - from.x, this.tip.y - from.y)
      // A slow pull tears wide; a quick one leaves a thin rip. Each tear starts
      // narrow, so its first end comes to a point.
      const base = Math.min(46, Math.max(24, this.size.width * 0.02))
      const speed = moved / Math.max(seconds, 0.001)
      const target = base * (1.15 - Math.min(0.5, speed / 4000))
      const previous = this.radius || target * 0.3
      this.radius = previous + (target - previous) * Math.min(1, seconds * 10)
      if (moved > 0.3 || this.travelled === 0) {
        uniforms['uTearing']!.value = 1
        uniforms['uFrom']!.value.set(from.x, from.y)
        uniforms['uTo']!.value.set(this.tip.x, this.tip.y)
        uniforms['uRadiusFrom']!.value = previous
        uniforms['uRadiusTo']!.value = this.radius
        uniforms['uTravelled']!.value = this.travelled
        uniforms['uSeed']!.value = this.seed
        this.travelled += moved || 0.001
        this.lastTear = now
      }
    }

    const [read, write] = this.targets as [WebGLRenderTarget, WebGLRenderTarget]
    uniforms['uPrevious']!.value = read.texture
    this.renderTear(write)
    this.targets = [write, read]
    this.page.uniforms['uMask']!.value = write.texture
    this.renderPage()

    // Keep drawing while there is a tear to make or one still open.
    const open = (now - this.lastTear) / 1000 < LONGEST_TEAR
    const following = !!this.pointer && !!this.tip && Math.hypot(this.pointer.x - this.tip.x, this.pointer.y - this.tip.y) > 0.3
    if (this.visible && (following || this.intro || open)) this.frame = requestAnimationFrame(this.tick)
  }
}

export function enhanceWrittenWorld(host: HTMLElement): { destroy(): void } {
  const effect = new WrittenWorldEffect(host)
  effect.connect()
  return effect
}
