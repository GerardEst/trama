import { Injectable } from '@angular/core'
import { node } from 'src/app/core/interfaces/interfaces'
import createPanZoom, { PanZoom } from 'panzoom'

@Injectable()
export class PanzoomService {
  private boardReference?: PanZoom
  private boardElement?: HTMLElement
  private initialPositionTimer?: ReturnType<typeof setTimeout>

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
    this.boardReference?.pause()
  }

  centerToNode(node: node) {
    if (!this.boardReference) return

    const scale = this.boardReference.getTransform().scale
    const viewport = this.boardElement?.parentElement?.getBoundingClientRect()
    const viewportWidth = viewport?.width ?? window.innerWidth
    const viewportHeight = viewport?.height ?? window.innerHeight

    const finalX = viewportWidth / 2 - (Number(node.left) + 100) * scale
    const finalY = viewportHeight / 2 - (Number(node.top) + 200) * scale

    this.boardReference.moveTo(finalX, finalY)
  }

  goTo(x: number, y: number) {
    this.boardReference?.moveTo(x, y)
  }

  getScale() {
    return this.boardReference?.getTransform().scale ?? 1
  }

  destroy() {
    if (this.initialPositionTimer) {
      clearTimeout(this.initialPositionTimer)
      this.initialPositionTimer = undefined
    }

    this.boardReference?.dispose()
    this.boardReference = undefined
    this.boardElement = undefined
  }
}
