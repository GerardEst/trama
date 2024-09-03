import {
  Component,
  ViewChild,
  ElementRef,
  Signal,
  computed,
  Input,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { node } from 'src/app/interfaces'

@Component({
  selector: 'polo-board-flows',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-flows.component.html',
  styleUrls: ['./board-flows.component.sass'],
})
export class BoardFlowsComponent {
  @Input() drawingFrom?: any
  @Input() drawingTo?: any

  @ViewChild('svg') svg?: ElementRef
  flowOptions: any = {
    pcurvature: 30,
    ncurvature: -30,
  }
  paths: Signal<any> = computed(() => {
    if (this.activeStory.entireTree().nodes) {
      return this.calculatePaths(this.activeStory.entireTree().nodes)
    }
  })

  constructor(public activeStory: ActiveStoryService) {}

  getDrawingPath(
    initialElement: string,
    finalPosition: HTMLElement | MouseEvent
  ) {
    if (!finalPosition) return

    if (finalPosition instanceof HTMLElement) {
      return this.getPath(initialElement, finalPosition)
    }

    const startDivPosition = this.getPositionOfElement(initialElement)

    const path = `M${startDivPosition?.left},${startDivPosition?.top} C${
      startDivPosition?.left + this.flowOptions.pcurvature
    },${startDivPosition?.top} ${
      finalPosition?.offsetX + this.flowOptions.ncurvature
    },${finalPosition?.offsetY} ${finalPosition?.offsetX},${finalPosition?.offsetY}`

    return path
  }

  getPath(initialElement: string, finalElement: string | HTMLElement) {
    const startDivPosition = this.getPositionOfElement(initialElement)
    const endDivPosition = this.getPositionOfElement(finalElement)

    if (!startDivPosition || !endDivPosition) {
      console.warn('Cannot get the path of non-existent element', {
        initialElement,
        finalElement,
      })
      return
    }

    const path = `M${startDivPosition.left},${startDivPosition.top} C${
      startDivPosition.left + this.flowOptions.pcurvature
    },${startDivPosition.top} ${
      endDivPosition.left + this.flowOptions.ncurvature
    },${endDivPosition.top} ${endDivPosition.left},${endDivPosition.top}`

    return path
  }

  // Builds all the paths needed
  calculatePaths(nodes: node[]) {
    console.warn('Calculating paths')

    const paths: any = []
    if (!nodes) return paths

    for (let node of nodes) {
      if (node.join) {
        for (let join of node.join) {
          paths.push(
            this.getPath(
              node.id + '_join',
              join.node + `_joiner${join.toAnswer ? '--answers' : ''}`
            )
          )
        }
      }
      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.join) {
            for (let join of answer.join) {
              paths.push(
                this.getPath(
                  answer.id + '_join',
                  join.node + `_joiner${join.toAnswer ? '--answers' : ''}`
                )
              )
            }
          }
        }
      }
      if (node.conditions) {
        for (let condition of node.conditions) {
          if (condition.join) {
            for (let join of condition.join) {
              paths.push(
                this.getPath(
                  condition.id + '_join',
                  join.node + `_joiner${join.toAnswer ? '--answers' : ''}`
                )
              )
            }
          }
        }
      }
      if (node.fallbackCondition?.join) {
        for (let join of node.fallbackCondition.join) {
          paths.push(
            this.getPath(
              node.fallbackCondition.id + '_join',
              join.node + `_joiner${join.toAnswer ? '--answers' : ''}`
            )
          )
        }
      }
    }

    return paths
  }

  getPositionOfElement(element: any) {
    const childElement =
      typeof element === 'string' ? document.getElementById(element) : element
    if (!childElement || !this.svg) return null

    const childRect = childElement.getBoundingClientRect()

    const centerX = childRect.left + childRect.width / 2
    const centerY = childRect.top + childRect.height / 2

    const svgPosition = this.convertScreenCoordinatesToSVGCoordinates(
      this.svg.nativeElement,
      centerX,
      centerY
    )

    return {
      left: svgPosition.x,
      top: svgPosition.y,
    }
  }

  convertScreenCoordinatesToSVGCoordinates(svgElement: any, x: any, y: any) {
    const point = svgElement.createSVGPoint()
    point.x = x
    point.y = y

    // Convert to SVG space using the current transformation matrix
    const transformedPoint = point.matrixTransform(
      svgElement.getScreenCTM().inverse()
    )

    return transformedPoint
  }
}
