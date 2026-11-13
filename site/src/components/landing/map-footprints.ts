interface Point {
  x: number
  y: number
  angle: number
}

interface Footstep extends Point {
  time: number
  side: number
  water: boolean
  variant: number
}

const STEP_DISTANCE = 23
const WAVE_DISTANCE = STEP_DISTANCE / 3
const TRAIL_LIFETIME = 4500
const WAVE_LIFETIME = 500
const DISCOVERY_LIFETIME = 2000
const DISCOVERY_FADE = 250
const MAX_STEPS = 64
const BRUSH_RADIUS = 86
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], [contenteditable="true"]'

// One section owns the effect. No document/window pointer listeners, and no
// animation frames once the trail has faded or the map leaves the viewport.
export class MapFootprints {
  private readonly root: HTMLElement
  private readonly original: HTMLImageElement
  private readonly colour: HTMLCanvasElement
  private readonly footprints: HTMLCanvasElement
  private readonly media = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  private readonly lifecycle = new AbortController()
  private listeners?: AbortController
  private scrolling?: AbortController
  private observer?: IntersectionObserver
  private resizeObserver?: ResizeObserver
  private visible = true
  private inside = false
  private failed = false
  private source?: HTMLImageElement
  private loading?: Promise<void>
  private cache?: HTMLCanvasElement
  private mask?: HTMLCanvasElement
  private paint?: CanvasRenderingContext2D
  private ink?: CanvasRenderingContext2D
  private brush?: CanvasRenderingContext2D
  private boot?: Path2D
  private bootLines?: Path2D
  private paperBoat?: HTMLImageElement
  private ripples: { outline: Path2D, grain: Path2D }[] = []
  private water?: ImageData
  private placement = { x: 0, y: 0, width: 1, height: 1 }
  private discoveries: { element: HTMLElement, x: number, y: number, radius: number, hideTimer?: ReturnType<typeof setTimeout> }[] = []
  private width = 0
  private height = 0
  private ratio = 1
  private frame = 0
  private pending?: { x: number, y: number }
  private client?: { x: number, y: number }
  private cursor?: Point
  private last?: Point
  private steps: Footstep[] = []
  private side = 1
  private mark = 0
  private inkColour = ''
  private lightInk = false

  constructor(private readonly host: HTMLElement) {
    this.root = host.querySelector<HTMLElement>('.story-map')!
    this.original = host.querySelector<HTMLImageElement>('.story-map__image')!
    this.colour = host.querySelector<HTMLCanvasElement>('.story-map__colour')!
    this.footprints = host.querySelector<HTMLCanvasElement>('.story-map__footprints')!
    this.media.addEventListener('change', this.configure, { signal: this.lifecycle.signal })
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(entries => {
        const bounds = this.host.getBoundingClientRect()
        this.visible = entries.some(entry => entry.isIntersecting) || (bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth)
        if (!this.visible) {
          this.inside = false
          this.reset()
        }
      })
      this.observer.observe(host)
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.source) return
        this.reset()
        if (this.source.src !== new URL(this.sourceUrl(), location.href).href) {
          this.source = undefined
          if (this.inside) this.load()
        } else this.resize()
      })
      this.resizeObserver.observe(this.root)
    }
    this.configure()
  }

  destroy() {
    this.lifecycle.abort()
    this.listeners?.abort()
    this.observer?.disconnect()
    this.resizeObserver?.disconnect()
    this.reset()
  }

  private configure = () => {
    if (!this.media.matches) {
      this.listeners?.abort()
      this.listeners = undefined
      this.inside = false
      this.reset()
      return
    }
    if (this.listeners) return
    this.listeners = new AbortController()
    const options = { passive: true, signal: this.listeners.signal }
    this.host.addEventListener('pointerenter', this.onMove, options)
    this.host.addEventListener('pointermove', this.onMove, options)
    this.host.addEventListener('pointerleave', this.onLeave, options)
  }

  private onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || this.failed || !this.media.matches) return
    this.visible = true
    this.inside = true
    if (event.target instanceof Element && event.target.closest(INTERACTIVE)) {
      this.onLeave()
      return
    }
    this.client = { x: event.clientX, y: event.clientY }
    this.pending = this.client
    if (!this.scrolling) {
      this.scrolling = new AbortController()
      window.addEventListener('scroll', this.onScroll, { passive: true, signal: this.scrolling.signal })
    }
    if (!this.source) {
      this.load()
      return
    }
    this.wake()
  }

  private onLeave = () => {
    this.inside = false
    this.pending = undefined
    this.client = undefined
    this.scrolling?.abort()
    this.scrolling = undefined
    if (this.cursor && this.last && Math.hypot(this.cursor.x - this.last.x, this.cursor.y - this.last.y) > STEP_DISTANCE / 2) {
      this.stamp(this.cursor, performance.now())
    }
    this.cursor = undefined
    this.last = undefined
    this.host.removeAttribute('data-map-exploring')
    this.host.removeAttribute('data-map-travel')
    if (this.paint) this.wake()
  }

  private onScroll = () => {
    if (this.client && this.inside) {
      this.pending = this.client
      this.wake()
    }
  }

  private load() {
    if (this.loading) return
    const image = new Image()
    const water = new Image()
    const boat = this.paperBoat ?? new Image()
    image.decoding = 'async'
    image.src = this.sourceUrl()
    water.src = this.root.clientWidth <= 600 ? this.colour.dataset['waterTall']! : this.colour.dataset['waterWide']!
    boat.src = this.colour.dataset['paperBoat']!
    this.loading = Promise.all([image.decode(), water.decode().catch(() => undefined), boat.decode().catch(() => undefined)]).then(() => {
      if (this.lifecycle.signal.aborted) return
      this.source = image
      this.cache = document.createElement('canvas')
      this.mask = document.createElement('canvas')
      this.paint = this.colour.getContext('2d') ?? undefined
      this.ink = this.footprints.getContext('2d') ?? undefined
      this.brush = this.mask.getContext('2d') ?? undefined
      if (!this.paint || !this.ink || !this.brush) return
      this.boot = new Path2D('M-2.5-8.7C-4.2-7.1-4.4-2.4-3.4 1.2L-2.7 3.3 2.8 3.6 3.6.8C4.3-2.2 3.9-7.3 2.4-8.6Q-.2-10.1-2.5-8.7ZM-2.6 5.1 2.6 4.9 2.3 8Q-.2 9.5-2.4 7.8Z')
      this.bootLines = new Path2D('M-2.5-6.2 1.2-7.8M-3-3.5 2.1-5.9M-2.9-.5 2.7-3M-1.8 2 2.6.1M-1.6 7.4 1.7 5.7')
      this.paperBoat = boat.naturalWidth ? boat : undefined
      this.ripples = [
        ['M-10 .4Q-8.5-.2-7.2 0L-6.4-.2Q-4.9-.6-3.4-.3L-2.6-.4Q-.8-.1.5-.3L1.2-.1Q3.5.4 5.1.1L6 .3Q8 .1 10 .5', 'M-8.8.1-7.7.05M-5.5-.25-4.4-.45M-1.8-.23-.7-.3M2.4.15 3.1.2M6.3.3 7.2.25'],
        ['M-9.5-.1Q-7.6.3-6.2.1L-5.1.3Q-3.3.5-1.8.1L-.9.2Q1-.3 2.7-.1L3.6-.3Q6.4-.1 7.8.3L8.8.2 10.5.5', 'M-8.4.1-7.3.25M-4.7.35-3.7.3M-.7.15.5-.15M3.8-.25 4.9-.15M8.1.3 9.4.35'],
        ['M-10.4.3-8.9.1Q-7.3.4-5.8.2L-4.9.4Q-2.7.1-1.6-.3L-.7-.1Q1.5-.4 3.2-.2L4.3.1Q6.8.5 8 .2L9.6.4', 'M-9.4.2-8.3.25M-6.3.25-5.2.35M-2.5-.05-1.2-.2M.5-.25 1.5-.3M5.1.25 6.5.35'],
      ].map(([outline, grain]) => ({ outline: new Path2D(outline), grain: new Path2D(grain) }))
      this.water = undefined
      if (water.naturalWidth) {
        const terrain = document.createElement('canvas')
        terrain.width = water.naturalWidth
        terrain.height = water.naturalHeight
        const context = terrain.getContext('2d', { willReadFrequently: true })
        context?.drawImage(water, 0, 0)
        this.water = context?.getImageData(0, 0, terrain.width, terrain.height)
      }
      this.resize()
      if (this.inside && this.media.matches && this.visible) this.wake()
    }).catch(() => {
      // The static ink map and the native cursor remain usable if an asset fails.
      this.failed = true
      this.reset()
    }).finally(() => { this.loading = undefined })
  }

  private sourceUrl() {
    return this.root.clientWidth <= 600 ? this.colour.dataset['colourTall']! : this.colour.dataset['colourWide']!
  }

  private resize() {
    if (!this.source || !this.cache || !this.mask) return
    const root = this.root.getBoundingClientRect()
    const image = this.original.getBoundingClientRect()
    this.width = root.width
    this.height = root.height
    this.ratio = Math.min(devicePixelRatio || 1, 1.5)
    for (const canvas of [this.colour, this.footprints, this.cache, this.mask]) {
      canvas.width = Math.round(this.width * this.ratio)
      canvas.height = Math.round(this.height * this.ratio)
      canvas.getContext('2d')?.setTransform(this.ratio, 0, 0, this.ratio, 0, 0)
    }
    const scale = Math.max(image.width / this.source.naturalWidth, image.height / this.source.naturalHeight)
    const width = this.source.naturalWidth * scale
    const height = this.source.naturalHeight * scale
    const [x, y] = getComputedStyle(this.original).objectPosition.split(' ').map(value => parseFloat(value) / 100)
    this.placement = { x: image.left - root.left + (image.width - width) * x!, y: image.top - root.top + (image.height - height) * y!, width, height }
    this.cache.getContext('2d')!.drawImage(this.source, this.placement.x, this.placement.y, width, height)
    this.discoveries = [...this.root.querySelectorAll<HTMLElement>('.map-event')].map(element => {
      const bounds = element.getBoundingClientRect()
      return { element, x: bounds.x + bounds.width / 2 - root.x, y: bounds.y + bounds.height / 2 - root.y, radius: Math.min(54, bounds.width * 0.36) }
    })
  }

  private onWater(point: Point) {
    if (!this.water) return false
    const x = Math.floor((point.x - this.placement.x) / this.placement.width * this.water.width)
    const y = Math.floor((point.y - this.placement.y) / this.placement.height * this.water.height)
    return x >= 0 && y >= 0 && x < this.water.width && y < this.water.height && this.water.data[(y * this.water.width + x) * 4] > 127
  }

  private discover(point: Point) {
    for (const discovery of this.discoveries) {
      if (Math.hypot(point.x - discovery.x, point.y - discovery.y) <= discovery.radius) {
        clearTimeout(discovery.hideTimer)
        discovery.element.classList.add('map-event--discovered')
        // Include the CSS fade in the two seconds since the last pass.
        discovery.hideTimer = setTimeout(() => {
          discovery.element.classList.remove('map-event--discovered')
          discovery.hideTimer = undefined
        }, DISCOVERY_LIFETIME - DISCOVERY_FADE)
      }
    }
  }

  private wake() {
    if (!this.frame && this.visible && this.media.matches && this.paint) this.frame = requestAnimationFrame(this.draw)
  }

  private stamp(point: Point, time: number) {
    this.steps.push({ ...point, time, side: this.side, water: this.onWater(point), variant: this.mark++ % this.ripples.length })
    this.discover(point)
    this.side *= -1
    if (this.steps.length > MAX_STEPS) this.steps.shift()
  }

  private advance(time: number) {
    if (!this.pending) return
    const bounds = this.root.getBoundingClientRect()
    const point = { x: this.pending.x - bounds.left, y: this.pending.y - bounds.top, angle: this.cursor?.angle ?? 0 }
    this.pending = undefined
    if (point.x < 0 || point.x > this.width || point.y < 0 || point.y > this.height) return this.onLeave()
    if (!this.last) {
      this.stamp(point, time)
      this.last = point
    } else {
      const dx = point.x - this.last.x, dy = point.y - this.last.y
      const distance = Math.hypot(dx, dy)
      if (distance > 1) point.angle = Math.atan2(dy, dx) + Math.PI / 2
      // Resample by distance, not pointer event frequency. Waves sit three times
      // closer together while walking keeps its original stride.
      const spacing = this.onWater(point) ? WAVE_DISTANCE : STEP_DISTANCE
      const count = Math.floor(distance / spacing)
      for (let step = Math.max(1, count - MAX_STEPS + 1); step <= count; step++) {
        const fraction = step * spacing / distance
        this.stamp({ x: this.last.x + dx * fraction, y: this.last.y + dy * fraction, angle: point.angle }, time)
      }
      if (count) this.last = { ...point, x: this.last.x + dx * count * spacing / distance, y: this.last.y + dy * count * spacing / distance }
    }
    this.cursor = point
    this.discover(point)
    this.inkColour = getComputedStyle(this.footprints).color
    const channels = this.inkColour.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0]
    this.lightInk = channels.reduce((sum, value) => sum + value, 0) > 384
    const water = this.onWater(point)
    this.host.toggleAttribute('data-map-exploring', !water || !!this.paperBoat)
    this.host.dataset['mapTravel'] = water ? 'water' : 'land'
  }

  private reveal(point: Point, opacity: number) {
    const gradient = this.brush!.createRadialGradient(point.x, point.y, 5, point.x, point.y, BRUSH_RADIUS)
    gradient.addColorStop(0, `rgba(255,255,255,${opacity})`)
    gradient.addColorStop(0.48, `rgba(255,255,255,${opacity * 0.85})`)
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    this.brush!.fillStyle = gradient
    this.brush!.fillRect(point.x - BRUSH_RADIUS, point.y - BRUSH_RADIUS, BRUSH_RADIUS * 2, BRUSH_RADIUS * 2)
  }

  private footprint(point: Point, side: number, opacity: number) {
    this.ink!.save()
    this.ink!.translate(point.x, point.y)
    this.ink!.rotate(point.angle)
    this.ink!.translate(side * 5, 0)
    this.ink!.rotate(Math.sin(point.x * 1.7 + point.y) * 0.035)
    this.ink!.lineCap = 'round'
    this.ink!.lineJoin = 'round'
    this.ink!.globalAlpha = opacity * 0.1
    this.ink!.fillStyle = this.inkColour
    this.ink!.strokeStyle = this.inkColour
    this.ink!.fill(this.boot!)
    this.ink!.globalAlpha = opacity * 0.88
    this.ink!.lineWidth = 0.85
    this.ink!.stroke(this.boot!)
    this.ink!.globalAlpha = opacity * 0.6
    this.ink!.lineWidth = 0.65
    this.ink!.stroke(this.bootLines!)
    this.ink!.translate(side * 0.35 || 0.3, -0.25)
    this.ink!.globalAlpha = opacity * 0.26
    this.ink!.lineWidth = 0.55
    this.ink!.stroke(this.boot!)
    this.ink!.restore()
  }

  private waterMark(point: Footstep, age: number) {
    const progress = age / WAVE_LIFETIME
    const variant = point.variant
    const expansion = progress ** (1.8 + variant * 0.2)
    const width = (0.3 + expansion * 1.6) * (0.94 + variant * 0.06)
    const depth = 0.8 + expansion * 0.2
    const opacity = Math.min(1, (1 - progress) / 0.4) * 0.58
    this.ink!.save()
    this.ink!.translate(point.x, point.y)
    this.ink!.rotate(point.angle + (variant - 1) * 0.035)
    this.ink!.translate((variant - 1) * expansion, expansion * (8 + variant))
    this.ink!.scale(width, depth)
    this.ink!.strokeStyle = this.inkColour
    this.ink!.lineCap = 'round'
    this.ink!.lineJoin = 'round'
    // Short accents follow the same shallow line, adding pencil grain without
    // turning one wave into several parallel crests.
    this.ink!.lineWidth = 0.75 / depth
    this.ink!.globalAlpha = opacity
    this.ink!.stroke(this.ripples[variant].outline)
    this.ink!.lineWidth = 0.45 / depth
    this.ink!.globalAlpha = opacity * 0.42
    this.ink!.stroke(this.ripples[variant].grain)
    this.ink!.restore()
  }

  private drawPaperBoat(point: Point) {
    if (!this.paperBoat) return
    this.ink!.save()
    this.ink!.translate(point.x, point.y)
    this.ink!.rotate(Math.sin(point.angle) * 0.12)
    this.ink!.globalAlpha = 0.95
    this.ink!.filter = this.lightInk ? 'invert(1)' : 'none'
    this.ink!.drawImage(this.paperBoat, -22, -16.5, 44, 33)
    this.ink!.restore()
  }

  private draw = (time: number) => {
    this.frame = 0
    if (!this.media.matches || !this.visible) return this.reset()
    if (!this.paint || !this.ink || !this.brush || !this.cache || !this.mask) return
    this.advance(time)
    this.steps = this.steps.filter(step => time - step.time < (step.water ? WAVE_LIFETIME : TRAIL_LIFETIME))
    this.brush.clearRect(0, 0, this.width, this.height)
    this.ink.clearRect(0, 0, this.width, this.height)
    for (const step of this.steps) {
      const age = Math.max(0, time - step.time)
      const progress = age / WAVE_LIFETIME
      const opacity = step.water ? Math.min(1, (1 - progress) / 0.75) : Math.min(1, (TRAIL_LIFETIME - age) / 2400)
      this.reveal(step, opacity)
      if (step.water) this.waterMark(step, age)
      else this.footprint(step, step.side, opacity)
    }
    if (this.cursor) {
      this.reveal(this.cursor, 1)
      if (this.onWater(this.cursor)) this.drawPaperBoat(this.cursor)
      else this.footprint(this.cursor, 0, 1)
    }
    this.paint.clearRect(0, 0, this.width, this.height)
    this.paint.drawImage(this.cache, 0, 0, this.width, this.height)
    this.paint.globalCompositeOperation = 'destination-in'
    this.paint.drawImage(this.mask, 0, 0, this.width, this.height)
    this.paint.globalCompositeOperation = 'source-over'
    if (this.steps.length) this.wake()
  }

  private reset() {
    cancelAnimationFrame(this.frame)
    this.frame = 0
    this.pending = undefined
    this.client = undefined
    this.scrolling?.abort()
    this.scrolling = undefined
    this.cursor = undefined
    this.last = undefined
    this.steps = []
    for (const discovery of this.discoveries) {
      clearTimeout(discovery.hideTimer)
      discovery.hideTimer = undefined
      discovery.element.classList.remove('map-event--discovered')
    }
    this.host.removeAttribute('data-map-exploring')
    this.host.removeAttribute('data-map-travel')
    this.paint?.clearRect(0, 0, this.width, this.height)
    this.ink?.clearRect(0, 0, this.width, this.height)
  }
}
