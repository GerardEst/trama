// The torn cover, drawn with WebGL directly. Two full-screen passes are all it
// needs, so it carries no 3D library: a modest computer has nothing to download
// or parse beyond this file, and the GPU does as little work as the picture allows.

interface Passage {
  name: string
  text: string
  answers: string[]
}

type Uniforms = Record<string, WebGLUniformLocation | null>

interface Pass {
  program: WebGLProgram
  uniforms: Uniforms
}

interface Target {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
}

// One triangle that covers the screen; its uv runs from 0 to 1 across the view.
const VERTEX = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// Value noise on an arithmetic hash: no sine, which is slow and imprecise on
// many integrated GPUs.
const NOISE = /* glsl */ `
  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.07; a *= 0.5; }
    return v;
  }
`

// The tear. The mask holds two things: in red, how close each point is to the
// line of a tear (1 on the line, 0 at its reach); in green, the tear's life,
// stored at half its value so an 8-bit mask can hold it too. Each frame life
// runs down, and the pointer tears one more piece, from where the tip was to
// where it is now. The line wanders and changes width as it goes, like paper
// that gives where it is weakest. A fresh tear starts its life at 1.6; tearing
// again where one is already open keeps it open. Only the points within the
// tear's reach pay for its noise.
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
    float life = max(previous.g * 2.0 - uAging, 0.0);
    float line = life > 0.0 ? previous.r : 0.0;
    if (uTearing > 0.5) {
      vec2 p = vUv * uSize;
      vec2 segment = uTo - uFrom;
      float length_ = max(length(segment), 0.001);
      vec2 along = segment / length_;
      float t = clamp(dot(p - uFrom, along) / length_, 0.0, 1.0);
      vec2 centre = uFrom + along * t * length_;
      // The line wanders by up to 0.35 of a radius 1.4 times the nominal one.
      if (distance(p, centre) < 2.0 * max(uRadiusFrom, uRadiusTo)) {
        vec2 across = vec2(-along.y, along.x);
        float run = uTravelled + t * length_;
        float radius = mix(uRadiusFrom, uRadiusTo, t) * (0.6 + 0.8 * noise(vec2(run / 70.0, uSeed + 7.0)));
        float wander = (noise(vec2(run / 45.0, uSeed)) - 0.5) * radius * 0.7;
        float distance_ = length(p - centre - across * wander);
        // The paper does not tear across the quiet words: the tear thins out and stops.
        float reach = clamp(1.0 - distance_ / radius, 0.0, 1.0) * (1.0 - quietness(p));
        if (reach > 0.0) {
          line = max(line, reach);
          life = life > 0.0 ? max(life, 1.0) : 1.6;
        }
      }
    }
    gl_FragColor = vec4(line, life * 0.5, 0.0, 1.0);
  }
`

// The page. A tear opens just after it is made, stays open, and closes again
// as its life runs out. Its edge is jagged at two scales; around it, a fringe of
// the paper's white fibres, and each side of the painting pulled a little away
// from the line. Through the opening, the words, each letter in a deeper tone of
// the landscape above it, the pilcrows and arrows in the cape's red; the torn
// edge casts a shadow on them, more from the upper side. The paper beneath is
// the page's own, so on a dark page the words are light.
//
// Most of the page is not torn at any moment: there the painting is all it
// draws, one texture read, and the rest of the work is skipped.
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
    vec4 tear = texture2D(uMask, vUv);
    float life = tear.g * 2.0;
    float opened = smoothstep(1.6, 1.48, life) * smoothstep(0.0, 0.7, life);
    if (opened <= 0.0) {
      gl_FragColor = vec4(texture2D(uImage, cover(vUv)).rgb, 1.0);
      return;
    }
    vec2 pixel = vUv * uResolution;

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
    float grain = noise(pixel / 1.4);
    float field = tear.r + (fbm(pixel / 8.0) - 0.5) * 0.24 + (noise(pixel / 2.4) - 0.5) * 0.07;
    float edge = 1.0 - opened * 0.74;
    float open = smoothstep(edge, edge + 0.012, field);
    float fringe = (0.05 + 0.1 * noise(pixel / 16.0)) * opened * mix(1.5, 0.35, upper);
    float fibres = smoothstep(edge - fringe - 0.012, edge - fringe, field + (grain - 0.5) * 0.06) * (1.0 - open);
    vec3 fibre = mix(vec3(0.99, 0.98, 0.95), vec3(0.88, 0.86, 0.81), (1.0 - grain) * 0.7);
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
// The page is drawn at the screen's density, up to 2, and at less when frames
// come too slowly: a modest GPU trades sharpness for a tear that keeps up.
const MAX_RATIO = 2
const SLOW_FRAME = 1000 / 40
const RATIO_STEP = 0.8

/** A uniform's location; null (a no-op to set) if the compiler left it out. */
const at = (pass: Pass, name: string) => pass.uniforms[name] ?? null

/** A CSS colour, as the browser computes it, in 0–1 sRGB channels. */
function parseColor(context: CanvasRenderingContext2D, color: string): [number, number, number] {
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = '#000'
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r! / 255, g! / 255, b! / 255]
}

class WrittenWorldEffect {
  private destroyed = false
  private gl?: WebGLRenderingContext
  private page?: Pass
  private tearing?: Pass
  private buffer?: WebGLBuffer | null
  private painting?: WebGLTexture | null
  private words?: WebGLTexture | null
  private targets: Target[] = []
  private maskFormat = { internal: 0, type: 0, step: 0 }
  private agingDebt = 0
  private colors?: CanvasRenderingContext2D | null
  private observer?: IntersectionObserver
  private resizer?: ResizeObserver
  private surface: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private visible = false
  private started = false
  private frame = 0
  private last = 0
  private lastTear = -Infinity
  private size = { width: 1, height: 1 }
  private ratio = 1
  private floor = 1
  private slowFrames = 0
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
    this.canvas?.removeEventListener('webglcontextlost', this.onContextLost)
    const gl = this.gl
    if (gl && !gl.isContextLost()) {
      this.disposeTargets()
      gl.deleteTexture(this.words ?? null)
      gl.deleteTexture(this.painting ?? null)
      gl.deleteBuffer(this.buffer ?? null)
      if (this.page) gl.deleteProgram(this.page.program)
      if (this.tearing) gl.deleteProgram(this.tearing.program)
    }
    this.gl = undefined
    this.host.removeAttribute('data-written')
  }

  private async start() {
    const canvas = this.host.querySelector('canvas')!
    const image = this.host.querySelector('img')!
    this.canvas = canvas
    const options: WebGLContextAttributes = { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false }
    const gl = (canvas.getContext('webgl2', options) ?? canvas.getContext('webgl', options)) as WebGLRenderingContext | null
    if (!gl || gl.isContextLost()) return
    this.gl = gl
    canvas.addEventListener('webglcontextlost', this.onContextLost)

    // The <img> has already chosen and decoded the right size; the texture reuses it.
    await image.decode().catch(() => undefined)
    if (this.destroyed || !image.naturalWidth) return

    this.family = getComputedStyle(this.surface?.querySelector('h1') ?? this.host).fontFamily
    await document.fonts.load(`16px ${this.family}`).catch(() => [])
    await document.fonts.load(`italic 16px ${this.family}`).catch(() => [])
    if (this.destroyed) return

    const page = this.link(PAGE)
    const tearing = this.link(TEAR)
    if (!page || !tearing) return this.destroy()
    this.page = page
    this.tearing = tearing

    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)

    this.painting = this.texture(image)
    this.maskFormat = this.chooseMaskFormat()

    gl.useProgram(page.program)
    gl.uniform1i(at(page, 'uImage'), 0)
    gl.uniform1i(at(page, 'uMask'), 1)
    gl.uniform1i(at(page, 'uWords'), 2)
    gl.uniform2f(at(page, 'uImageSize'), image.naturalWidth, image.naturalHeight)
    gl.useProgram(tearing.program)
    gl.uniform1i(at(tearing, 'uPrevious'), 0)
    gl.uniform4f(at(tearing, 'uQuiet'), -1e5, -1e5, -1e5, -1e5)

    this.colors = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    this.readColors()

    this.ratio = Math.min(devicePixelRatio || 1, MAX_RATIO)
    this.floor = Math.min(1, this.ratio) * 0.75
    this.resizer = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = window.setTimeout(() => this.resize(), 120)
    })
    this.resizer.observe(this.host)
    this.resize()
    if (this.destroyed) return
    this.host.setAttribute('data-written', '')
    this.playIntro()
  }

  private onContextLost = (event: Event) => {
    event.preventDefault()
    // The painting under the canvas comes back; the effect does not.
    this.destroy()
  }

  private link(fragment: string): Pass | undefined {
    const gl = this.gl!
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const vertex = compile(gl.VERTEX_SHADER, VERTEX)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragment)
    const program = gl.createProgram()!
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragmentShader)
    gl.bindAttribLocation(program, 0, 'position')
    gl.linkProgram(program)
    gl.deleteShader(vertex)
    gl.deleteShader(fragmentShader)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('written-world: shader failed to link', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return undefined
    }
    const uniforms: Uniforms = {}
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i)!.name
      uniforms[name] = gl.getUniformLocation(program, name)
    }
    return { program, uniforms }
  }

  /** A texture from an image or canvas, the right way up for the shaders' uv. */
  private texture(source: TexImageSource) {
    const gl = this.gl!
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    this.sampling()
    return texture
  }

  private sampling() {
    const gl = this.gl!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  // Half floats keep the tear's life in small steps where WebGL 2 can render
  // to them; elsewhere an 8-bit mask runs it down in coarser steps, which still
  // reads well (see agingDebt).
  private chooseMaskFormat() {
    const gl = this.gl!
    const byte = { internal: gl.RGBA, type: gl.UNSIGNED_BYTE, step: 2 / 255 }
    if (!(typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)) return byte
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return byte
    const half = { internal: gl.RGBA16F, type: gl.HALF_FLOAT, step: 0 }
    const probe = this.makeTarget(4, 4, half)
    gl.bindFramebuffer(gl.FRAMEBUFFER, probe.framebuffer)
    const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.deleteFramebuffer(probe.framebuffer)
    gl.deleteTexture(probe.texture)
    return complete ? half : byte
  }

  private makeTarget(width: number, height: number, format = this.maskFormat): Target {
    const gl = this.gl!
    const texture = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, gl.RGBA, format.type, null)
    this.sampling()
    const framebuffer = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return { texture, framebuffer }
  }

  private disposeTargets() {
    const gl = this.gl
    for (const target of this.targets) {
      gl?.deleteFramebuffer(target.framebuffer)
      gl?.deleteTexture(target.texture)
    }
    this.targets = []
  }

  // The theme can change while the page is open, so each tear reads the
  // colours again: the cape and graphite (set on this element) and the paper.
  private readColors() {
    const gl = this.gl
    if (!gl || !this.page || !this.colors) return
    const style = getComputedStyle(this.host)
    gl.useProgram(this.page.program)
    const paper = parseColor(this.colors, getComputedStyle(document.body).backgroundColor)
    gl.uniform3f(at(this.page, 'uPaper'), ...paper)
    gl.uniform3f(at(this.page, 'uCape'), ...parseColor(this.colors, style.color))
    gl.uniform3f(at(this.page, 'uGraphite'), ...parseColor(this.colors, style.outlineColor))
    gl.uniform1f(at(this.page, 'uDark'), paper[0] * 0.3 + paper[1] * 0.59 + paper[2] * 0.11 < 0.5 ? 1 : 0)
  }

  // Where the quiet words are, in the tear's coordinates (origin bottom left).
  private measureQuiet() {
    const selector = this.host.dataset['quiet']
    const quiet = selector ? this.surface?.querySelector(selector) : null
    const gl = this.gl
    if (!quiet || !gl || !this.tearing) return
    const own = this.host.getBoundingClientRect()
    const rect = quiet.getBoundingClientRect()
    gl.useProgram(this.tearing.program)
    gl.uniform4f(at(this.tearing, 'uQuiet'), rect.left - own.left, own.bottom - rect.bottom, rect.right - own.left, own.bottom - rect.top)
  }

  private resize() {
    const gl = this.gl
    if (!gl || !this.page || !this.tearing || gl.isContextLost()) return
    const { width, height } = this.host.getBoundingClientRect()
    if (!width || !height) return
    this.size = { width, height }
    this.fitCanvas()
    const maskWidth = Math.ceil(width * MASK_SCALE)
    const maskHeight = Math.ceil(height * MASK_SCALE)
    this.disposeTargets()
    this.targets = [this.makeTarget(maskWidth, maskHeight), this.makeTarget(maskWidth, maskHeight)]
    // The words are set once per size, at the screen's own density.
    gl.deleteTexture(this.words ?? null)
    this.words = this.texture(this.typeset(width, height, Math.min(devicePixelRatio || 1, MAX_RATIO)))
    gl.useProgram(this.page.program)
    gl.uniform2f(at(this.page, 'uResolution'), width, height)
    gl.uniform2f(at(this.page, 'uMaskTexel'), 1 / maskWidth, 1 / maskHeight)
    gl.useProgram(this.tearing.program)
    gl.uniform2f(at(this.tearing, 'uSize'), width, height)
    this.measureQuiet()
    this.renderPage()
  }

  private fitCanvas() {
    const canvas = this.canvas!
    const width = Math.max(1, Math.round(this.size.width * this.ratio))
    const height = Math.max(1, Math.round(this.size.height * this.ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
  }

  private renderTear(target: Target) {
    const gl = this.gl!
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
    gl.viewport(0, 0, Math.ceil(this.size.width * MASK_SCALE), Math.ceil(this.size.height * MASK_SCALE))
    gl.useProgram(this.tearing!.program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.targets[0]!.texture)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  private renderPage() {
    const gl = this.gl!
    const canvas = this.canvas!
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(this.page!.program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.painting ?? null)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.targets[0]?.texture ?? null)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, this.words ?? null)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  // The words beneath: the cover's story, set as one long justified page. The
  // lines grow from the top of the landscape to its foot, so the letters keep
  // the painting's depth. Body text goes in the red channel, the marks in green.
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
    const split = (text: string, style: Omit<Word, 'text'> = {}) => text.split(' ').filter(Boolean).map(word => ({ text: word, ...style }))
    const words: Word[] = passages.flatMap(passage => [
      ...(passage.name ? [...split(passage.name, { italic: true }), { text: '—', italic: true }] : []),
      ...split(passage.text),
      ...passage.answers.flatMap(answer => [{ text: '→', mark: true }, ...split(answer, { italic: true })]),
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
    if (event.pointerType === 'touch' || !this.gl) return
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

  // The first pointer interaction reveals how the cover can be torn.
  private playIntro() {
    const { width, height } = this.size
    // Wide, beside the title on the left hillside; narrow, across the strip of
    // landscape between the title and the story.
    const points: [number, number][] = width >= 900
      ? [[0.03, 0.5], [0.11, 0.45], [0.19, 0.5], [0.28, 0.43]]
      : [[0.04, 0.22], [0.3, 0.28], [0.62, 0.22], [0.96, 0.29]]
    this.intro = { started: performance.now() + 700, points: points.map(([x, y]) => [x * width, y * height]) }
    this.wake()
  }

  private wake() {
    if (this.frame || !this.visible || !this.gl) return
    this.last = performance.now()
    this.slowFrames = 0
    this.frame = requestAnimationFrame(this.tick)
  }

  // A run of slow frames lowers the page's resolution a step, down to a floor.
  private pace(elapsed: number) {
    if (this.ratio <= this.floor) return
    this.slowFrames = elapsed > SLOW_FRAME ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1)
    if (this.slowFrames < 8) return
    this.slowFrames = 0
    this.ratio = Math.max(this.floor, this.ratio * RATIO_STEP)
    this.fitCanvas()
  }

  private tick = (now: number) => {
    this.frame = 0
    const gl = this.gl
    if (!gl || !this.tearing || !this.page || gl.isContextLost()) return
    // The frame's timestamp can be a little older than the moment it was asked for.
    const elapsed = Math.max(0, now - this.last)
    const seconds = Math.min(0.05, elapsed / 1000)
    this.last = now
    this.pace(elapsed)

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

    gl.useProgram(this.tearing.program)
    // An 8-bit mask cannot hold less than one step of life: the ageing is kept
    // until it adds up to a whole step, so tears close at the same pace there.
    let aging = seconds * LIFE_PER_SECOND
    if (this.maskFormat.step) {
      this.agingDebt += aging
      aging = Math.floor(this.agingDebt / this.maskFormat.step) * this.maskFormat.step
      this.agingDebt -= aging
    }
    gl.uniform1f(at(this.tearing, 'uAging'), aging)
    gl.uniform1f(at(this.tearing, 'uTearing'), 0)
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
        gl.uniform1f(at(this.tearing, 'uTearing'), 1)
        gl.uniform2f(at(this.tearing, 'uFrom'), from.x, from.y)
        gl.uniform2f(at(this.tearing, 'uTo'), this.tip.x, this.tip.y)
        gl.uniform1f(at(this.tearing, 'uRadiusFrom'), previous)
        gl.uniform1f(at(this.tearing, 'uRadiusTo'), this.radius)
        gl.uniform1f(at(this.tearing, 'uTravelled'), this.travelled)
        gl.uniform1f(at(this.tearing, 'uSeed'), this.seed)
        this.travelled += moved || 0.001
        this.lastTear = now
      }
    }

    // Read the mask from the first target, write it into the second, then swap.
    const [read, write] = this.targets as [Target, Target]
    this.renderTear(write)
    this.targets = [write, read]
    this.renderPage()

    // Keep drawing while there is a tear to make or one still open. The intro's
    // aim may have asked for the next frame already: one frame is asked for at a
    // time, or every frame would draw twice as often as the one before it.
    const open = (now - this.lastTear) / 1000 < LONGEST_TEAR
    const following = !!this.pointer && !!this.tip && Math.hypot(this.pointer.x - this.tip.x, this.pointer.y - this.tip.y) > 0.3
    if (!this.frame && this.visible && (following || this.intro || open)) this.frame = requestAnimationFrame(this.tick)
  }
}

export function enhanceWrittenWorld(host: HTMLElement): { destroy(): void } {
  const effect = new WrittenWorldEffect(host)
  effect.connect()
  return effect
}
