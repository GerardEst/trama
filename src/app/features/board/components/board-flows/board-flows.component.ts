import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Signal,
  ViewChild,
  computed,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { join, node } from 'src/app/core/interfaces/interfaces'
import { BasicButtonComponent } from '../../../../shared/components/ui/basic-button/basic-button.component'
import { StoryEditorService } from '../../services/story-editor.service'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
import { BoardJoinStroke, BoardPoint } from '../../board-interactions'

interface Point {
  left: number
  top: number
}

interface CoordinateContext {
  svg: SVGSVGElement
  inverseMatrix: DOMMatrix
}

interface JoinOrigin {
  id: string
  join?: join[]
}

interface BoardFlowPath {
  id: string
  origin: string
  destiny: string
  toAnswer: boolean
  svgPath: string
}

interface JoinContextMenuInfo {
  origin?: string
  destiny?: string
  toAnswer?: boolean
}

@Component({
  selector: 'polo-board-flows',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './board-flows.component.html',
  styleUrls: ['./board-flows.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardFlowsComponent {
  @Input() drawingStroke?: BoardJoinStroke

  @ViewChild('svg') svg?: ElementRef<SVGSVGElement>
  @ViewChild('openContextCursor')
  openContextCursor?: ElementRef<HTMLElement>
  @ViewChild('joinContextMenu') joinContextMenu?: ElementRef<HTMLElement>

  showContextMenuCursor = false
  showJoinContextMenu = false

  readonly flowOptions = {
    positiveCurvature: 30,
    negativeCurvature: -30,
  }

  joinContextMenuInfo: JoinContextMenuInfo = {}

  readonly paths: Signal<BoardFlowPath[]> = computed(() => {
    this.anchorRegistry.version()
    return this.calculatePaths(this.activeStory.entireTree().nodes)
  })

  constructor(
    public activeStory: ActiveStoryService,
    private storyEditor: StoryEditorService,
    private anchorRegistry: BoardAnchorRegistryService
  ) {}

  scheduleRefresh() {
    this.anchorRegistry.invalidate()
  }

  changeCursorStyle(state: boolean) {
    this.showContextMenuCursor = state
  }

  setCursorAndContextMenuPosition(event: MouseEvent) {
    if (!this.openContextCursor) return

    this.openContextCursor.nativeElement.style.top = event.offsetY - 11 + 'px'
    this.openContextCursor.nativeElement.style.left = event.offsetX - 11 + 'px'
  }

  openJoinContext(
    event: MouseEvent,
    origin: string,
    destiny: string,
    toAnswer: boolean
  ) {
    this.showJoinContextMenu = true
    this.joinContextMenuInfo = { origin, destiny, toAnswer }

    if (!this.joinContextMenu) return
    this.joinContextMenu.nativeElement.style.top = event.offsetY - 11 + 'px'
    this.joinContextMenu.nativeElement.style.left = event.offsetX - 11 + 'px'
  }

  deleteJoin() {
    const { origin, destiny, toAnswer } = this.joinContextMenuInfo
    if (!origin || !destiny) return

    const removed = this.storyEditor.removeJoin(origin, destiny, toAnswer)
    if (!removed) {
      console.warn('Impossible to delete the join')
      return
    }
    this.showJoinContextMenu = false
  }

  createPath(initialElement: HTMLElement, finalPosition: BoardPoint) {
    const context = this.createCoordinateContext()
    if (!context) return undefined

    const startPosition = this.getPositionOfElement(initialElement, context)
    const endPosition = this.convertScreenCoordinatesToSVGCoordinates(
      context,
      finalPosition.x,
      finalPosition.y
    )

    if (!startPosition || !endPosition) return undefined
    return this.createCurvePath(startPosition, endPosition)
  }

  calculatePaths(nodes: node[]) {
    const context = this.createCoordinateContext()
    if (!context) return []

    const positions = new Map<string, Point>()
    const paths: BoardFlowPath[] = []

    for (const origin of this.getJoinOrigins(nodes)) {
      for (const storyJoin of origin.join ?? []) {
        const path = this.getPath(origin, storyJoin, context, positions)
        if (path) paths.push(path)
      }
    }

    return paths
  }

  private getPath(
    origin: JoinOrigin,
    destiny: join,
    context: CoordinateContext,
    positions: Map<string, Point>
  ): BoardFlowPath | undefined {
    const toAnswer = !!destiny.toAnswer
    const initialAnchor = `${origin.id}_join`
    const finalAnchor = `${destiny.node}_joiner${toAnswer ? '--answers' : ''}`
    const startPosition = this.getCachedPosition(
      initialAnchor,
      context,
      positions
    )
    const endPosition = this.getCachedPosition(finalAnchor, context, positions)
    if (!startPosition || !endPosition) return undefined

    return {
      id: `${origin.id}::${destiny.node}::${toAnswer ? 'answers' : 'node'}`,
      origin: origin.id,
      destiny: destiny.node,
      toAnswer,
      svgPath: this.createCurvePath(startPosition, endPosition),
    }
  }

  private getCachedPosition(
    anchorId: string,
    context: CoordinateContext,
    positions: Map<string, Point>
  ) {
    const cachedPosition = positions.get(anchorId)
    if (cachedPosition) return cachedPosition

    const position = this.getPositionOfElement(anchorId, context)
    if (position) positions.set(anchorId, position)
    return position
  }

  private getPositionOfElement(
    element: string | HTMLElement,
    context: CoordinateContext
  ): Point | undefined {
    const childElement =
      typeof element === 'string' ? this.anchorRegistry.get(element) : element
    if (!childElement) return undefined

    const childRect = childElement.getBoundingClientRect()
    return this.convertScreenCoordinatesToSVGCoordinates(
      context,
      childRect.left + childRect.width / 2,
      childRect.top + childRect.height / 2
    )
  }

  private createCoordinateContext(): CoordinateContext | undefined {
    const svg = this.svg?.nativeElement
    const screenMatrix = svg?.getScreenCTM()
    if (!svg || !screenMatrix) return undefined

    return { svg, inverseMatrix: screenMatrix.inverse() }
  }

  private convertScreenCoordinatesToSVGCoordinates(
    context: CoordinateContext,
    x: number,
    y: number
  ): Point {
    const point = context.svg.createSVGPoint()
    point.x = x
    point.y = y
    const transformedPoint = point.matrixTransform(context.inverseMatrix)

    return { left: transformedPoint.x, top: transformedPoint.y }
  }

  private createCurvePath(start: Point, end: Point) {
    return `M${start.left},${start.top} C${
      start.left + this.flowOptions.positiveCurvature
    },${start.top} ${end.left + this.flowOptions.negativeCurvature},${
      end.top
    } ${end.left},${end.top}`
  }

  private *getJoinOrigins(nodes: node[]): Generator<JoinOrigin> {
    for (const storyNode of nodes) {
      yield storyNode
      yield* this.getNestedJoinOrigins(storyNode.answers)
      yield* this.getNestedJoinOrigins(storyNode.conditions)
      if (storyNode.fallbackCondition) yield storyNode.fallbackCondition
    }
  }

  private *getNestedJoinOrigins(
    origins: readonly JoinOrigin[] | undefined
  ): Generator<JoinOrigin> {
    for (const origin of origins ?? []) yield origin
  }
}
