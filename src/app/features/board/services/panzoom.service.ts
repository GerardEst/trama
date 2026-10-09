import { Injectable } from '@angular/core'
import { node } from 'src/app/core/interfaces/interfaces'
import createPanZoom, { PanZoom } from 'panzoom'

const CENTERING_DURATION_MS = 320

@Injectable()
export class PanzoomService {
  private boardReference?: PanZoom
  private boardElement?: HTMLElement
  private initialPositionTimer?: ReturnType<typeof setTimeout>
  private centeringFrame?: number

  focusElements: boolean = true

  createPanzoomBoard(
    element: HTMLElement | undefined,
    options: {
      initialZoom: number | undefined
      zoomable: boolean
      initialPosition: { x: number; y: number }
    }
  ) {
    if (!element) return

    this.destroy()
    this.boardElement = element

    //https://github.com/anvaka/panzoom
    this.boardReference = createPanZoom(element, {
      maxZoom: 1,
      minZoom: 0.1,
      filterKey: function (/* e, dx, dy, dz */) {
        // don't let panzoom handle this event:
        return true
      },
      beforeWheel: (e) => {
        if (options.zoomable) return
        // allow wheel-zoom only if altKey is down. Otherwise - ignore
        const shouldIgnore = !e.altKey
        return shouldIgnore
      },
      initialZoom: options.initialZoom ?? 1,
      zoomSpeed: 0.065,
      zoomDoubleClickSpeed: 1,
    })

    // Let open popovers distinguish a completed board pan from an outside click.
    this.boardReference.on('panstart', () => {
      this.stopCentering()
      this.boardElement?.dispatchEvent(
        new CustomEvent('poloBoardPanStart', { bubbles: true })
      )
    })
    this.boardReference.on('zoom', () => this.stopCentering())

    this.initialPositionTimer = setTimeout(() => {
      this.boardReference?.moveTo(
        -options.initialPosition.x,
        -options.initialPosition.y
      )
    })
  }

  resumeDrag() {
    this.boardReference?.resume()
  }

  pauseDrag() {
    this.stopCentering()
    this.boardReference?.pause()
  }

  centerToNode(node: Pick<node, 'left' | 'top'>, smooth = false) {
    this.stopCentering()
    const board = this.boardReference
    if (!board) return

    const { scale, x, y } = board.getTransform()
    const viewport = this.boardElement?.parentElement?.getBoundingClientRect()
    const viewportWidth = viewport?.width ?? window.innerWidth
    const viewportHeight = viewport?.height ?? window.innerHeight

    const finalX = viewportWidth / 2 - (Number(node.left) + 100) * scale
    const finalY = viewportHeight / 2 - (Number(node.top) + 200) * scale

    if (!smooth || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      board.moveTo(finalX, finalY)
      return
    }

    // Own the frame so a new target, manual pan or teardown can cancel the move.
    let started: number | undefined
    const animate = (now: number) => {
      started ??= now
      const progress = Math.min((now - started) / CENTERING_DURATION_MS, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      board.moveTo(x + (finalX - x) * eased, y + (finalY - y) * eased)
      this.centeringFrame = progress < 1 ? requestAnimationFrame(animate) : undefined
    }
    this.centeringFrame = requestAnimationFrame(animate)
  }

  stopCentering() {
    if (this.centeringFrame !== undefined) cancelAnimationFrame(this.centeringFrame)
    this.centeringFrame = undefined
  }

  goTo(x: number, y: number) {
    this.stopCentering()
    this.boardReference?.moveTo(x, y)
  }

  /** Translate in screen pixels, including while manual panning is paused. */
  moveBy(dx: number, dy: number): { x: number; y: number } {
    this.stopCentering()
    const board = this.boardReference
    if (!board) return { x: 0, y: 0 }
    const { x, y } = board.getTransform()
    board.moveTo(x + dx, y + dy)
    const applied = board.getTransform()
    // panzoom normally renders on the NEXT frame. Drag compensation must share
    // this frame with the camera, otherwise a stationary node visibly drifts.
    if (this.boardElement) {
      this.boardElement.style.transformOrigin = '0 0 0'
      this.boardElement.style.transform =
        `matrix(${applied.scale}, 0, 0, ${applied.scale}, ${applied.x}, ${applied.y})`
    }
    return { x: applied.x - x, y: applied.y - y }
  }

  getScale() {
    return this.boardReference?.getTransform().scale ?? 1
  }

  destroy() {
    this.stopCentering()
    if (this.initialPositionTimer) {
      clearTimeout(this.initialPositionTimer)
      this.initialPositionTimer = undefined
    }

    this.boardReference?.dispose()
    this.boardReference = undefined
    this.boardElement = undefined
  }
}
