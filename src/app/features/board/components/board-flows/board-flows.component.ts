import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Signal,
  ViewChild,
  computed,
  signal,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { node } from 'src/app/core/interfaces/interfaces'
import { projectBoardJoins, ProjectedBoardJoin } from '../../board-join-projection'
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
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-board-flows',
  standalone: true,
  imports: [BasicButtonComponent, TranslatePipe],
  templateUrl: './board-flows.component.html',
  styleUrls: ['./board-flows.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardFlowsComponent {
  @Input() drawingStroke?: BoardJoinStroke
  private readonly inputProjectedJoins = signal<
    ProjectedBoardJoin[] | undefined
  >(undefined)
  @Input() set projectedJoins(value: ProjectedBoardJoin[] | undefined) {
    this.inputProjectedJoins.set(value)
  }
  private readonly currentGroupId = signal<string | undefined>(undefined)
  @Input() set groupId(value: string | undefined) {
    this.currentGroupId.set(value)
  }

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
    return this.calculatePaths(
      this.activeStory.entireTree().nodes,
      this.currentGroupId(),
      this.inputProjectedJoins()
    )
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

  calculatePaths(
    nodes: node[],
    groupId?: string,
    projectedJoins = projectBoardJoins(nodes, groupId)
  ) {
    const context = this.createCoordinateContext()
    if (!context) return []

    const positions = new Map<string, Point>()
    const paths: BoardFlowPath[] = []

    for (const storyJoin of projectedJoins) {
      const startPosition = this.getCachedPosition(
        storyJoin.fromAnchor, context, positions
      )
      const endPosition = this.getCachedPosition(
        storyJoin.toAnchor, context, positions
      )
      if (!startPosition || !endPosition) continue
      paths.push({
        id: storyJoin.id,
        origin: storyJoin.origin,
        destiny: storyJoin.destiny,
        toAnswer: storyJoin.toAnswer,
        svgPath: this.createCurvePath(startPosition, endPosition),
      })
    }

    return paths
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
}
