import { Injectable, signal } from '@angular/core'
import { node } from 'src/app/core/interfaces/interfaces'
import createPanZoom, { PanZoom } from 'panzoom'
import { isBoardControl } from '../board-interactions'

const CENTERING_DURATION_MS = 320
export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 1

/** Room to leave, in screen pixels, between the fitted story and each edge of the board. */
export interface BoardInsets {
  top: number
  right: number
  bottom: number
  left: number
}

/** A rectangle in board coordinates. */
export interface BoardBounds {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * The zoom and translation that show `bounds` whole and centred in a viewport, without
 * enlarging it past the board's maximum zoom.
 */
export function fitTransform(
  bounds: BoardBounds,
  viewport: { width: number; height: number },
  insets: BoardInsets
): { scale: number; x: number; y: number } {
  const width = Math.max(1, viewport.width - insets.left - insets.right)
  const height = Math.max(1, viewport.height - insets.top - insets.bottom)
  const boundsWidth = Math.max(1, bounds.right - bounds.left)
  const boundsHeight = Math.max(1, bounds.bottom - bounds.top)
  const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(width / boundsWidth, height / boundsHeight)))
  return {
    scale,
    x: insets.left + (width - boundsWidth * scale) / 2 - bounds.left * scale,
    y: insets.top + (height - boundsHeight * scale) / 2 - bounds.top * scale,
  }
}

@Injectable()
export class PanzoomService {
  private boardReference?: PanZoom
  private boardElement?: HTMLElement
  private initialPositionTimer?: ReturnType<typeof setTimeout>
  private centeringFrame?: number

  focusElements: boolean = true
  /** The board's zoom, for the controls that show it. */
  readonly scale = signal(1)

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
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
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
      // panzoom cancels every touchstart, which stops the browser from turning
      // a tap into focus or a click. Let taps reach controls; the board still pans.
      onTouch: (e) => !isBoardControl(e.target),
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
    this.scale.set(this.boardReference.getTransform().scale)
    this.boardReference.on('zoom', () => {
      this.stopCentering()
      const scale = this.boardReference?.getTransform().scale ?? 1
      if (scale !== this.scale()) this.scale.set(scale)
    })

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

  /** Zoom by a factor around the middle of the visible board, within the board's limits. */
  zoomBy(factor: number) {
    const board = this.boardReference
    const viewport = this.boardElement?.parentElement
    if (!board || !viewport) return
    this.stopCentering()
    this.stopGliding()
    const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, board.getTransform().scale * factor))
    board.zoomAbs(viewport.clientWidth / 2, viewport.clientHeight / 2, scale)
  }

  zoomTo(scale: number) {
    const current = this.boardReference?.getTransform().scale
    if (current) this.zoomBy(scale / current)
  }

  /** Show a region of the board whole, leaving `insets` free for the panels over the board. */
  fitBounds(bounds: BoardBounds, insets: BoardInsets) {
    const board = this.boardReference
    const viewport = this.boardElement?.parentElement
    if (!board || !viewport) return
    this.stopCentering()
    this.stopGliding()
    const { scale, x, y } = fitTransform(bounds, { width: viewport.clientWidth, height: viewport.clientHeight }, insets)
    board.zoomAbs(0, 0, scale)
    board.moveTo(x, y)
  }

  /**
   * A released pan keeps gliding for a moment, and would carry the board away from a zoom or a fit
   * asked for meanwhile. Pausing is panzoom's only way to stop it; a pan paused by a drag stays so.
   */
  private stopGliding() {
    const board = this.boardReference
    if (!board || board.isPaused()) return
    board.pause()
    board.resume()
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
