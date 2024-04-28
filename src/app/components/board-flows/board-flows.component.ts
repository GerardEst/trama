import {
  Component,
  ViewChild,
  ElementRef,
  Signal,
  computed,
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

  getPath(initialElement: string, finalElement: string) {
    const startDivPosition = this.getPositionOfElement(initialElement)
    const endDivPosition = this.getPositionOfElement(finalElement)

    const path = `M${startDivPosition?.left},${startDivPosition?.top} C${
      startDivPosition?.left + this.flowOptions.pcurvature
    },${startDivPosition?.top} ${
      endDivPosition?.left + this.flowOptions.ncurvature
    },${endDivPosition?.top} ${endDivPosition?.left},${endDivPosition?.top}`

    return path
  }

  // Builds all the paths needed
  calculatePaths(nodes: node[]) {
    const svgContainer = this.svg?.nativeElement
    if (!svgContainer)
      return console.log('svgContainer still not present. Skipping.')
    const mapSize = svgContainer?.getBoundingClientRect()
    svgContainer.setAttribute(
      'viewBox',
      `0 0 ${mapSize.width} ${mapSize.height}`
    )
    console.log('svgContainer', svgContainer)

    const paths: any = []
    if (!nodes) return paths

    for (let node of nodes) {
      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.join) {
            for (let join of answer.join) {
              paths.push(this.getPath(answer.id + '_join', join.node + '_join'))
            }
          }
        }
      }
      if (node.conditions) {
        for (let condition of node.conditions) {
          if (condition.join) {
            for (let join of condition.join) {
              paths.push(
                this.getPath(condition.id + '_join', join.node + '_join')
              )
            }
          }
        }
      }
      if (node.fallbackCondition?.join) {
        for (let join of node.fallbackCondition.join) {
          this.getPath(node.fallbackCondition.id + '_join', join.node + '_join')
        }
      }
    }

    console.timeEnd('calculatePaths')
    return paths
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
    return { top: 0, left: 0 }
  }
}
