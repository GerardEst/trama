import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterContentInit,
  AfterContentChecked,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import * as draw from 'src/app/utils/drawing-utils'

@Component({
  selector: 'polo-board-flows',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-flows.component.html',
  styleUrls: ['./board-flows.component.sass'],
})
export class BoardFlowsComponent implements AfterContentChecked {
  @Input() connections?: Array<object>

  @ViewChild('svg') svg?: ElementRef
  svgContainer?: ElementRef

  ngAfterContentChecked(): void {
    this.updateFlowLines()
  }

  updateFlowLines() {
    const svgContainer = this.svg?.nativeElement

    if (svgContainer) svgContainer.innerHTML = ''

    if (svgContainer) {
      const mapSize = svgContainer?.getBoundingClientRect()

      svgContainer.setAttribute(
        'viewBox',
        `0 0 ${mapSize.width} ${mapSize.height}`
      )

      this.connections?.forEach((connection: any) => {
        const startDivPosition = this.getPositionOf(connection.origin)
        const endDivPosition = this.getPositionOf(connection.destiny)

        if (startDivPosition && endDivPosition) {
          const line = draw.line(startDivPosition, endDivPosition)
          svgContainer.appendChild(line)
        }
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
}
