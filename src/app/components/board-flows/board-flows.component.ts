import { Component, Input, ViewChild, ElementRef, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Component({
  selector: 'polo-board-flows',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-flows.component.html',
  styleUrls: ['./board-flows.component.sass'],
})
export class BoardFlowsComponent {
  @ViewChild('svg') svg?: ElementRef

  constructor(public activeStory: ActiveStoryService) {}

  calculatePath(line: any) {
    const svgContainer = this.svg?.nativeElement
    const mapSize = svgContainer?.getBoundingClientRect()
    svgContainer.setAttribute(
      'viewBox',
      `0 0 ${mapSize.width} ${mapSize.height}`
    )

    const startDivPosition = this.getPositionOfElement(line.origin)
    const endDivPosition = this.getPositionOfElement(line.destiny)

    if (startDivPosition && endDivPosition) {
      const pcurvature = 30
      const ncurvature = -30
      const path = `M${startDivPosition?.left},${startDivPosition?.top} C${
        startDivPosition?.left + pcurvature
      },${startDivPosition?.top} ${
        endDivPosition?.left + ncurvature
      },${endDivPosition?.top} ${endDivPosition?.left},${endDivPosition?.top}`

      return path
    }

    return undefined
  }

  getPositionOfElement(element: string) {
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
