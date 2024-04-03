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

  connections: Signal<any> = computed(() => {
    if (this.activeStory.entireTree().nodes) {
      return this.calculateConnections(this.activeStory.entireTree().nodes)
    }
  })
  paths: Signal<any> = computed(() => {
    if (this.connections() && this.connections().length > 0) {
      return this.calculatePaths(this.connections())
    }
  })

  constructor(public activeStory: ActiveStoryService) {}

  // Builds all the connections. This means: origin -> destiny object
  calculateConnections(nodes: node[]) {
    const connections: any = []
    if (!nodes) return connections
    for (let node of nodes) {
      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.join) {
            for (let join of answer.join) {
              connections.push({
                origin: answer.id + '_join',
                destiny: join.node + '_join',
              })
            }
          }
        }
      }
      if (node.conditions) {
        for (let condition of node.conditions) {
          if (condition.join) {
            for (let join of condition.join) {
              connections.push({
                origin: condition.id + '_join',
                destiny: join.node + '_join',
              })
            }
          }
        }
      }
      if (node.fallbackCondition?.join) {
        for (let join of node.fallbackCondition.join) {
          connections.push({
            origin: node.fallbackCondition.id + '_join',
            destiny: join.node + '_join',
          })
        }
      }
    }

    return connections
  }

  // Builds all the pats. This means: the svg path of every connection
  calculatePaths(connections: any) {
    const svgContainer = this.svg?.nativeElement
    const mapSize = svgContainer?.getBoundingClientRect()
    svgContainer.setAttribute(
      'viewBox',
      `0 0 ${mapSize.width} ${mapSize.height}`
    )

    const paths: any = []
    for (let connection of connections) {
      const startDivPosition = this.getPositionOfElement(connection.origin)
      const endDivPosition = this.getPositionOfElement(connection.destiny)

      if (startDivPosition && endDivPosition) {
        const pcurvature = 30
        const ncurvature = -30
        const path = `M${startDivPosition?.left},${startDivPosition?.top} C${
          startDivPosition?.left + pcurvature
        },${startDivPosition?.top} ${
          endDivPosition?.left + ncurvature
        },${endDivPosition?.top} ${endDivPosition?.left},${endDivPosition?.top}`

        paths.push(path)
      }
    }
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
    return undefined
  }
}
