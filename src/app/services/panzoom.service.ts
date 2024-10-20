import { Injectable } from '@angular/core'
import { node } from 'src/app/interfaces'
import createPanZoom from 'panzoom'

@Injectable({ providedIn: 'root' })
export class PanzoomService {
  boardReference: any
  focusElements: boolean = true

  constructor() {}

  createPanzoomBoard(
    element: any,
    options: { initialZoom: number | undefined; zoomable: boolean }
  ) {
    //https://github.com/anvaka/panzoom
    this.boardReference = createPanZoom(element, {
      maxZoom: 1,
      minZoom: 0.4,
      filterKey: function (/* e, dx, dy, dz */) {
        // don't let panzoom handle this event:
        return true
      },
      beforeWheel: (e) => {
        if (options.zoomable) return
        // allow wheel-zoom only if altKey is down. Otherwise - ignore
        var shouldIgnore = !e.altKey
        return shouldIgnore
      },
      initialZoom: options.initialZoom || 1,
      zoomSpeed: 0.065,
      zoomDoubleClickSpeed: 1,
    })
  }

  resumeDrag() {
    this.boardReference.resume()
  }

  pauseDrag() {
    this.boardReference.pause()
  }

  centerToNode(node: node) {
    // TODO - Here we should calculate the correct transform taken into account the zoom level. Now it "works" but it's not perfect

    const scale = this.boardReference.getTransform().scale

    const finalX = (-node.left + window.innerWidth / 2 - 100) * scale
    const finalY = (-node.top + window.innerHeight / 2 - 200) * scale

    this.boardReference.moveTo(finalX, finalY)
  }

  goTo(x: number, y: number) {
    this.boardReference.moveTo(x, y)
  }
}
