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
import { node, tree } from 'src/app/core/interfaces/interfaces'
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
  styleUrls: ['./board-flows.component.css'],
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

  // SVG/board coordinates survive camera pan and zoom: both anchors and SVG
  // share the camera transform. Only moved owners need measuring during a drag.
  private readonly positions = new Map<string, Point | undefined>()
  private readonly anchorsByNode = new Map<string, Set<string>>()
  private readonly joinsByAnchor = new Map<string, Set<ProjectedBoardJoin>>()
  private readonly pathsById = new Map<string, BoardFlowPath>()
  private cachedJoins: ProjectedBoardJoin[] = []
  private cachedPaths: BoardFlowPath[] = []
  private geometryReady = false
  private previousTree?: tree
  private previousGroupId?: string
  private previousProjection?: ProjectedBoardJoin[]
  private previousVersion = -1

  readonly paths: Signal<BoardFlowPath[]> = computed(() => {
    const version = this.anchorRegistry.version()
    const storyTree = this.activeStory.entireTree()
    const groupId = this.currentGroupId()
    const projection = this.inputProjectedJoins()
    const changedNodes = this.anchorRegistry.changedNodesSince(this.previousVersion)
    // Tree edits still refresh everything: content can move sibling anchors,
    // and committing positions can also relocate the group's boundary ports.
    const fullRefresh = !this.geometryReady || changedNodes === undefined ||
      storyTree !== this.previousTree || groupId !== this.previousGroupId ||
      projection !== this.previousProjection

    this.previousVersion = version
    this.previousTree = storyTree
    this.previousGroupId = groupId
    this.previousProjection = projection

    return fullRefresh
      ? this.calculatePaths(storyTree.nodes, groupId, projection)
      : this.refreshMovedNodes(changedNodes)
  })

  constructor(
    public activeStory: ActiveStoryService,
    private storyEditor: StoryEditorService,
    private anchorRegistry: BoardAnchorRegistryService
  ) {}

  scheduleRefresh(nodeIds?: Iterable<string>) {
    this.anchorRegistry.invalidate(nodeIds)
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
    projectedJoins = projectBoardJoins(nodes, groupId, this.activeStory.entireTree().entryPoint)
  ) {
    this.geometryReady = false
    this.positions.clear()
    this.anchorsByNode.clear()
    this.joinsByAnchor.clear()
    this.pathsById.clear()
    this.cachedJoins = projectedJoins
    this.cachedPaths = []
    const context = this.createCoordinateContext()
    if (!context) return this.cachedPaths

    for (const storyJoin of projectedJoins) {
      this.indexAnchor(storyJoin.fromNode, storyJoin.fromAnchor, storyJoin)
      this.indexAnchor(storyJoin.toNode, storyJoin.toAnchor, storyJoin)
      const path = this.calculateJoinPath(storyJoin, context)
      if (path) {
        this.pathsById.set(path.id, path)
        this.cachedPaths.push(path)
      }
    }
    this.geometryReady = true
    return this.cachedPaths
  }

  private indexAnchor(nodeId: string | undefined, anchorId: string, storyJoin: ProjectedBoardJoin) {
    if (nodeId !== undefined) {
      const anchors = this.anchorsByNode.get(nodeId) ?? new Set<string>()
      anchors.add(anchorId)
      this.anchorsByNode.set(nodeId, anchors)
    }
    const joins = this.joinsByAnchor.get(anchorId) ?? new Set<ProjectedBoardJoin>()
    joins.add(storyJoin)
    this.joinsByAnchor.set(anchorId, joins)
  }

  private refreshMovedNodes(nodeIds: ReadonlySet<string>) {
    const affectedJoins = new Set<ProjectedBoardJoin>()
    for (const nodeId of nodeIds) {
      for (const anchorId of this.anchorsByNode.get(nodeId) ?? []) {
        this.positions.delete(anchorId)
        for (const storyJoin of this.joinsByAnchor.get(anchorId) ?? []) {
          affectedJoins.add(storyJoin)
        }
      }
    }
    if (!affectedJoins.size) return this.cachedPaths
    const context = this.createCoordinateContext()
    if (!context) {
      this.geometryReady = false
      return []
    }

    let changed = false
    for (const storyJoin of affectedJoins) {
      const previous = this.pathsById.get(storyJoin.id)
      const path = this.calculateJoinPath(storyJoin, context)
      if (path === previous) continue
      changed = true
      if (path) this.pathsById.set(path.id, path)
      else this.pathsById.delete(storyJoin.id)
    }
    if (changed) {
      this.cachedPaths = []
      for (const storyJoin of this.cachedJoins) {
        const path = this.pathsById.get(storyJoin.id)
        if (path) this.cachedPaths.push(path)
      }
    }
    return this.cachedPaths
  }

  private calculateJoinPath(storyJoin: ProjectedBoardJoin, context: CoordinateContext) {
    const start = this.getCachedPosition(storyJoin.fromAnchor, context)
    const end = this.getCachedPosition(storyJoin.toAnchor, context)
    if (!start || !end) return undefined
    const svgPath = this.createCurvePath(start, end)
    const previous = this.pathsById.get(storyJoin.id)
    if (previous?.svgPath === svgPath) return previous
    return {
      id: storyJoin.id,
      origin: storyJoin.origin,
      destiny: storyJoin.destiny,
      toAnswer: storyJoin.toAnswer,
      svgPath,
    }
  }

  private getCachedPosition(anchorId: string, context: CoordinateContext) {
    if (this.positions.has(anchorId)) return this.positions.get(anchorId)
    const position = this.getPositionOfElement(anchorId, context)
    this.positions.set(anchorId, position)
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
