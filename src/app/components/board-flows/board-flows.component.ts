import { Component, Input, ViewChild, ElementRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import * as draw from 'src/app/utils/drawing-utils'

@Component({
  selector: 'polo-board-flows',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-flows.component.html',
  styleUrls: ['./board-flows.component.sass'],
})
export class BoardFlowsComponent {
  @Input() connections?: Array<any>
  calculatedPositions?: Array<any>

  @ViewChild('svg') svg?: ElementRef
  svgContainer?: ElementRef

  ngAfterContentChecked() {
    this.updateFlowLines()
  }

  updateFlowLines() {
    // This is called a lot. Caution.
    // console.log('updateFlowLines')

    const svgContainer = this.svg?.nativeElement

    if (svgContainer) {
      const mapSize = svgContainer?.getBoundingClientRect()

      svgContainer.setAttribute(
        'viewBox',
        `0 0 ${mapSize.width} ${mapSize.height}`
      )

      this.calculatedPositions = this.connections?.map((connection: any) => {
        const startDivPosition = this.getPositionOf(connection.origin)
        const endDivPosition = this.getPositionOf(connection.destiny)

        // Els control points haurien de ser la posicio + una mica
        if (startDivPosition && endDivPosition) {
          return {
            start: startDivPosition,
            end: endDivPosition,
          }
        }
        return undefined
      })
    }
  }

  getPositionOf(element: string) {
    const childElement = document.getElementById(element)
    const parentRect = this.svg?.nativeElement.getBoundingClientRect()
    const childRect = childElement?.getBoundingClientRect()

    if (childRect) {
      const lineX = childRect.left + (childRect.right - childRect.left) / 2
      const lineY = childRect.top + (childRect.bottom - childRect.top) / 2
      const relativePosition = {
        top: lineY - parentRect.top,
        left: lineX - parentRect.left,
      }
      return relativePosition
    }
    return undefined
  }

  getPath(line: any) {
    const pcurvature = 50
    const ncurvature = -50
    const path = `M${line?.start?.left},${line?.start?.top} C${
      line?.start?.left + pcurvature
    },${line?.start?.top} ${line?.end?.left + ncurvature},${line?.end?.top} ${
      line?.end?.left
    },${line?.end?.top}`

    return path
  }
}
