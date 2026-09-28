import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewChildren,
  QueryList,
  HostListener,
  OnInit,
  AfterViewInit,
  OnDestroy,
  computed,
  signal,
} from '@angular/core'
import { NodeComponent } from './components/node/node.component'
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
  CdkDragMove,
  CdkDragStart,
  DragRef,
  Point,
} from '@angular/cdk/drag-drop'
import { BoardFlowsComponent } from './components/board-flows/board-flows.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { boardFrame, node } from 'src/app/core/interfaces/interfaces'
import { PanzoomService } from 'src/app/features/board/services/panzoom.service'
import { generateIDForNewNode } from 'src/app/shared/utils/tree-searching'
import { StoryEditorService } from './services/story-editor.service'
import { BoardAnchorRegistryService } from './services/board-anchor-registry.service'
import { BoardPreferencesService } from './services/board-preferences.service'
import { StorageService } from 'src/app/shared/services/storage.service'
import { BoardJoinStroke, BoardPoint } from './board-interactions'
import { projectBoardJoins } from './board-join-projection'
import { BoardAnchorDirective } from './directives/board-anchor.directive'

interface JoinCounts {
  incoming: number
  outgoing: number
}

const EMPTY_JOIN_COUNTS: JoinCounts = { incoming: 0, outgoing: 0 }

interface BoardJoinTarget {
  nodeId: string
  toAnswer: boolean
  anchor: HTMLElement
}

@Component({
  selector: 'polo-board',
  standalone: true,
  imports: [
    NodeComponent,
    CdkDrag,
    CdkDragHandle,
    BoardFlowsComponent,
    BoardAnchorDirective,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PanzoomService, BoardAnchorRegistryService],
})
export class BoardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('board') boardElement?: ElementRef<HTMLElement>
  @ViewChild(BoardFlowsComponent) boardFlows?: BoardFlowsComponent
  @ViewChildren('nodeDrag') nodeDrags?: QueryList<CdkDrag<string>>
  @ViewChildren(NodeComponent) nodeComponents?: QueryList<NodeComponent>

  @Input() grid?: boolean
  @Input() groupControls = false
  @Input() initialZoom?: number
  @Input() focusElements: boolean = true
  @Input() initialPosition: { x: number; y: number } = { x: 0, y: 0 }
  @Input() zoomable: boolean = true

  // Context menu
  contextMenuPosition = { x: 0, y: 0 }
  contextMenuActive = false
  // Drags to join
  joinStroke?: BoardJoinStroke
  private joinPointerId?: number
  private readonly groupNavigation = signal<
    { storyId: string; groupId?: string } | undefined
  >(undefined)
  get currentGroupId(): string | undefined {
    const navigation = this.groupNavigation()
    return navigation?.storyId === this.activeStory.storyId()
      ? navigation.groupId
      : undefined
  }
  set currentGroupId(groupId: string | undefined) {
    this.groupNavigation.set({ storyId: this.activeStory.storyId(), groupId })
  }

  readonly projectedJoins = computed(() =>
    projectBoardJoins(this.activeStory.entireTree().nodes, this.currentGroupId)
  )

  readonly visibleFrames = computed(() => {
    const visibleIds = new Set(this.visibleBoardNodes().map((node) => node.id))
    return (this.activeStory.entireTree().frames ?? []).filter(
      (frame) => frame.groupId === this.currentGroupId &&
        frame.nodeIds.some((id) => visibleIds.has(id))
    )
  })

  private readonly visibleBoardNodes = computed(() =>
    this.activeStory.entireTree().nodes.filter(
      (storyNode) => storyNode.groupId === this.currentGroupId
    )
  )

  private readonly boundaryPositions = computed(() => {
    const nodes = this.visibleBoardNodes()
    const group = this.currentGroup()
    const lefts = nodes.map((storyNode) => Number(storyNode.left) || 0)
    const tops = nodes.map((storyNode) => Number(storyNode.top) || 0)
    const top = Math.min(...tops, Number(group?.top) || 0)
    return {
      in: { left: Math.min(...lefts, Number(group?.left) || 0) - 280, top },
      out: { left: Math.max(...lefts, Number(group?.left) || 0) + 380, top },
    }
  })

  private readonly childCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const storyNode of this.activeStory.entireTree().nodes) {
      if (storyNode.groupId) {
        counts.set(storyNode.groupId, (counts.get(storyNode.groupId) ?? 0) + 1)
      }
    }
    return counts
  })

  readonly joinCounts = computed(() => {
    const groups = new Map<string, JoinCounts>()
    const boundary: JoinCounts = { incoming: 0, outgoing: 0 }
    for (const storyJoin of this.projectedJoins()) {
      if (storyJoin.fromBoundary) boundary.incoming++
      if (storyJoin.toBoundary) boundary.outgoing++
      if (storyJoin.toAnchor.endsWith('_group-entry')) {
        const groupId = storyJoin.toAnchor.slice(0, -'_group-entry'.length)
        const counts = groups.get(groupId) ?? { incoming: 0, outgoing: 0 }
        counts.incoming++
        groups.set(groupId, counts)
      }
      if (storyJoin.fromAnchor.endsWith('_group-exit')) {
        const groupId = storyJoin.fromAnchor.slice(0, -'_group-exit'.length)
        const counts = groups.get(groupId) ?? { incoming: 0, outgoing: 0 }
        counts.outgoing++
        groups.set(groupId, counts)
      }
    }
    return { groups, boundary }
  })
  private readonly activeNodeSelection = signal<
    { storyId: string; nodeId: string } | undefined
  >(undefined)
  readonly activeNodeId = computed(() => {
    const selection = this.activeNodeSelection()
    return selection?.storyId === this.activeStory.storyId()
      ? selection.nodeId
      : undefined
  })
  selectedNodeIds = new Set<string>()
  selectionBox?: { left: number; top: number; width: number; height: number }
  private selectionPointerId?: number
  private selectionStart?: BoardPoint
  private selectionScreenStart?: BoardPoint
  private groupDrag?: {
    sourceId: string
    positions: Map<string, Point>
    origin: Point
  }
  private readonly frameDragPositions = new Map<
    string,
    { x: number; y: number; position: Point }
  >()
  private readonly nodeDragPositions = new Map<
    string,
    { left: number; top: number; position: Point }
  >()

  get isDrawingJoin() {
    return !!this.joinStroke
  }

  readonly constrainNodePosition = (
    pointerPosition: Point,
    _dragRef: DragRef,
    dimensions: DOMRect,
    pickupPosition: Point
  ): Point => {
    const scale = this.panzoom.getScale()
    const initialPointerX = dimensions.left + pickupPosition.x
    const initialPointerY = dimensions.top + pickupPosition.y

    return {
      x: dimensions.left + (pointerPosition.x - initialPointerX) / scale,
      y: dimensions.top + (pointerPosition.y - initialPointerY) / scale,
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  handleDocumentPointerDown(event: PointerEvent) {
    const target = event.target
    if (target instanceof Element &&
      this.boardElement?.nativeElement.contains(target.closest('polo-node, .groupNode'))) return
    this.clearActiveNode()
  }

  @HostListener('document:keydown', ['$event'])
  handleBoardKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !event.altKey && !event.ctrlKey &&
      !event.metaKey && !event.shiftKey) {
      this.handleEscape()
      return
    }

    const target = event.target
    if (
      event.repeat || event.altKey || event.shiftKey ||
      this.isDrawingJoin || this.selectionPointerId !== undefined ||
      (target instanceof Element && target.closest(
        'input, textarea, select, [contenteditable], [role="textbox"], dialog, [role="dialog"]'
      ))
    ) return

    const nodeId = this.activeNodeId()
    const storyNode = this.visibleNodes().find((node) => node.id === nodeId)
    if (!storyNode) return

    const modifier = event.ctrlKey || event.metaKey
    const key = event.key.toLowerCase()
    if (key === 'delete' && !modifier && storyNode.id !== 'node_0') {
      event.preventDefault()
      if (storyNode.type === 'group') this.ungroup(storyNode.id)
      else {
        this.clearActiveNode()
        void this.removeNode({ nodeId: storyNode.id })
      }
    } else if (modifier && key === 'u' && this.frameForNode(storyNode.id)) {
      event.preventDefault()
      this.removeNodeFromFrame(storyNode.id)
    } else if (modifier && key === 'd' && storyNode.type !== 'group') {
      event.preventDefault()
      this.duplicateNode(storyNode.id)
    } else if (modifier && key === 'i' && storyNode.type !== 'group' && storyNode.type !== 'distributor') {
      const nodeComponent = this.nodeComponents?.find((component) => component.nodeId === storyNode.id)
      if (nodeComponent?.openImagePicker()) event.preventDefault()
    }
  }

  handleEscape() {
    const wasInteracting = this.isDrawingJoin || this.selectionPointerId !== undefined
    if (this.isDrawingJoin) this.stopDragging()
    if (this.selectionPointerId !== undefined) this.stopSelection()
    if (wasInteracting) this.panzoom.resumeDrag()
    this.selectedNodeIds = new Set()
  }

  @HostListener('contextmenu', ['$event'])
  handleRightClick(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target) return

    if (target.classList.contains('board')) {
      event.preventDefault() // Prevent the default context menu from appearing
      if (this.isDrawingJoin) {
        this.stopDragging()
        this.panzoom.resumeDrag()
      } else {
        this.openContextMenu(event)
      }
    }
  }

  constructor(
    public panzoom: PanzoomService,
    public activeStory: ActiveStoryService,
    private storyEditor: StoryEditorService,
    private preferences: BoardPreferencesService,
    private storage: StorageService,
    private anchorRegistry: BoardAnchorRegistryService
  ) {}

  ngOnInit() {
    // Sets if the board elements should focus on create or not (for the landing page)
    this.panzoom.focusElements = this.focusElements
  }

  ngAfterViewInit(): void {
    this.panzoom.createPanzoomBoard(this.boardElement?.nativeElement, {
      initialPosition: this.initialPosition,
      initialZoom: this.initialZoom,
      zoomable: this.zoomable,
    })
  }

  ngOnDestroy() {
    this.panzoom.destroy()
  }

  public centerToNode(node: node | undefined) {
    if (!node) return

    this.clearActiveNode()
    this.currentGroupId = node.groupId
    this.selectedNodeIds = new Set()
    this.panzoom.centerToNode(node)
  }

  public goTo(x: number, y: number) {
    this.panzoom.goTo(x, y)
  }

  public refreshFlows() {
    this.boardFlows?.scheduleRefresh()
  }

  visibleNodes(): node[] {
    return this.visibleBoardNodes()
  }

  boundaryPosition(side: 'in' | 'out') {
    return this.boundaryPositions()[side]
  }

  groupPortCounts(groupId: string): JoinCounts {
    return this.joinCounts().groups.get(groupId) ?? EMPTY_JOIN_COUNTS
  }

  nodeChildCount(groupId: string): number {
    return this.childCounts().get(groupId) ?? 0
  }

  currentGroup(): node | undefined {
    return this.activeStory.entireTree().nodes.find(
      (storyNode) =>
        storyNode.id === this.currentGroupId && storyNode.type === 'group'
    )
  }

  canFrameSelection(): boolean {
    return (
      this.selectedNodeIds.size >= 2 &&
      this.visibleNodes().filter((storyNode) => this.selectedNodeIds.has(storyNode.id))
        .length === this.selectedNodeIds.size
    )
  }

  frameSelection() {
    if (!this.canFrameSelection()) return
    if (this.storyEditor.frameNodes(this.selectedNodeIds, this.currentGroupId)) {
      this.selectedNodeIds = new Set()
      this.closeContextMenu()
    }
  }

  renameFrame(frameId: string, event: Event) {
    this.storyEditor.renameFrame(frameId, (event.target as HTMLInputElement).value)
  }

  removeFrame(frameId: string) {
    this.storyEditor.removeFrame(frameId)
  }

  frameForNode(nodeId: string): boardFrame | undefined {
    return this.visibleFrames().find((frame) => frame.nodeIds.includes(nodeId))
  }

  removeNodeFromFrame(nodeId: string) {
    const frame = this.frameForNode(nodeId)
    const storyNode = this.visibleNodes().find((node) => node.id === nodeId)
    if (!frame || !storyNode) return
    const bounds = this.frameBounds(frame)
    this.storyEditor.removeNodeFromFrame(nodeId, {
      x: bounds.left + bounds.width + 48,
      y: Number(storyNode.top) || 0,
    })
    this.refreshFlows()
  }

  frameBounds(frame: boardFrame) {
    const members = new Set(frame.nodeIds)
    const nodes = this.visibleNodes().filter((storyNode) => members.has(storyNode.id))
    const drags = new Map(
      (this.nodeDrags?.toArray() ?? []).map((drag) => [drag.data, drag])
    )
    const left = Math.min(...nodes.map((node) => Number(node.left) || 0)) - 32
    const top = Math.min(...nodes.map((node) => Number(node.top) || 0)) - 56
    const right = Math.max(...nodes.map((node) =>
      (Number(node.left) || 0) + (drags.get(node.id)?.element.nativeElement.offsetWidth || 260)
    )) + 32
    const bottom = Math.max(...nodes.map((node) =>
      (Number(node.top) || 0) + (drags.get(node.id)?.element.nativeElement.offsetHeight || 160)
    )) + 32
    return { left, top, width: right - left, height: bottom - top }
  }

  getFrameDragPosition(frame: boardFrame): Point {
    const { left: x, top: y } = this.frameBounds(frame)
    const cached = this.frameDragPositions.get(frame.id)
    if (cached?.x === x && cached.y === y) return cached.position
    const position = { x, y }
    this.frameDragPositions.set(frame.id, { x, y, position })
    return position
  }

  canGroupSelection(): boolean {
    return (
      this.selectedNodeIds.size >= 2 &&
      !this.selectedNodeIds.has('node_0') &&
      this.visibleNodes().filter((storyNode) => this.selectedNodeIds.has(storyNode.id))
        .length === this.selectedNodeIds.size
    )
  }

  groupSelection() {
    if (!this.canGroupSelection()) return
    const groupId = this.storyEditor.groupNodes(
      this.selectedNodeIds,
      this.currentGroupId
    )
    if (groupId) {
      this.selectedNodeIds = new Set()
      this.closeContextMenu()
      this.refreshFlows()
    }
  }

  enterGroup(groupId: string) {
    const group = this.visibleNodes().find(
      (storyNode) => storyNode.id === groupId && storyNode.type === 'group'
    )
    if (!group) return
    this.currentGroupId = groupId
    this.selectedNodeIds = new Set()
    this.clearActiveNode()
    this.closeContextMenu()
    const first = this.visibleNodes()[0]
    if (first) this.panzoom.centerToNode(first)
    this.refreshFlows()
  }

  leaveGroup() {
    const group = this.currentGroup()
    if (!group) return
    this.currentGroupId = group.groupId
    this.selectedNodeIds = new Set()
    this.clearActiveNode()
    this.closeContextMenu()
    this.panzoom.centerToNode(group)
    this.refreshFlows()
  }

  ungroup(groupId: string) {
    this.storyEditor.ungroupNodes(groupId)
    this.selectedNodeIds = new Set()
    this.clearActiveNode()
    this.refreshFlows()
  }

  renameGroup(groupId: string, event: Event) {
    const name = (event.target as HTMLInputElement).value.trim()
    this.storyEditor.updateNodeText(groupId, name || 'Group')
  }

  openContextMenu(event: MouseEvent) {
    event.preventDefault()

    this.contextMenuPosition = this.getBoardPosition(event)

    this.contextMenuActive = true
  }

  closeContextMenu() {
    this.contextMenuActive = false
  }

  checkDragStart(event: PointerEvent) {
    if (event.button !== 0) return

    const board = this.boardElement?.nativeElement
    if (event.target === board) {
      if (event.ctrlKey) {
        this.selectionPointerId = event.pointerId
        this.selectionStart = this.getBoardPosition(event)
        this.selectionScreenStart = { x: event.clientX, y: event.clientY }
        this.selectedNodeIds = new Set()
        this.selectionBox = {
          left: this.selectionStart.x,
          top: this.selectionStart.y,
          width: 0,
          height: 0,
        }
        board.setPointerCapture(event.pointerId)
        this.panzoom.pauseDrag()
        event.preventDefault()
      } else {
        this.selectedNodeIds = new Set()
      }
      this.clearActiveNode()
      return
    }

    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const origin = target.closest<HTMLElement>('[data-board-origin]')
    const originId = origin?.dataset['boardOrigin']
    if (!origin || !originId || !board?.contains(origin)) return

    this.joinStroke = {
      originId,
      from: origin,
      to: { x: event.clientX, y: event.clientY },
    }
    this.joinPointerId = event.pointerId
    board.setPointerCapture(event.pointerId)
    this.panzoom.pauseDrag()
  }

  checkDrag(event: PointerEvent) {
    if (event.pointerId === this.selectionPointerId && this.selectionStart) {
      const position = this.getBoardPosition(event)
      this.selectionBox = {
        left: Math.min(this.selectionStart.x, position.x),
        top: Math.min(this.selectionStart.y, position.y),
        width: Math.abs(position.x - this.selectionStart.x),
        height: Math.abs(position.y - this.selectionStart.y),
      }
      this.updateSelection(event)
      return
    }
    if (!this.joinStroke || event.pointerId !== this.joinPointerId) return

    const joinTarget = this.getJoinTarget(event)
    const to = joinTarget
      ? this.getElementCenter(joinTarget.anchor)
      : { x: event.clientX, y: event.clientY }

    this.joinStroke = { ...this.joinStroke, to }
  }

  checkDragStop(event: PointerEvent) {
    if (event.pointerId === this.selectionPointerId) {
      this.checkDrag(event)
      this.stopSelection()
      this.panzoom.resumeDrag()
      return
    }
    if (event.button !== 0) return

    const stroke = this.joinStroke
    if (!stroke || event.pointerId !== this.joinPointerId) {
      this.panzoom.resumeDrag()
      return
    }

    const elementAtPointer = this.getElementAtPointer(event)
    const returnedToOrigin = elementAtPointer === stroke.from

    if (!returnedToOrigin) {
      const joinTarget = this.getJoinTarget(event)
      if (joinTarget) {
        this.storyEditor.updateJoinOfOption(
          stroke.originId,
          joinTarget.nodeId,
          joinTarget.toAnswer
        )
      } else if (
        this.isInsideBoard(elementAtPointer) &&
        !elementAtPointer?.closest('.groupNode, .boundaryNode')
      ) {
        this.addNode(event, 'content')
      }
    }

    this.stopDragging()
    this.panzoom.resumeDrag()
  }

  cancelJoin(event: PointerEvent) {
    if (event.pointerId === this.selectionPointerId) {
      this.stopSelection()
      this.selectedNodeIds = new Set()
      this.panzoom.resumeDrag()
      return
    }
    if (event.pointerId !== this.joinPointerId) return

    this.stopDragging()
    this.panzoom.resumeDrag()
  }

  stopDragging() {
    const board = this.boardElement?.nativeElement
    const pointerId = this.joinPointerId

    this.joinStroke = undefined
    this.joinPointerId = undefined

    if (
      board &&
      pointerId !== undefined &&
      board.hasPointerCapture(pointerId)
    ) {
      board.releasePointerCapture(pointerId)
    }
  }

  private stopSelection() {
    const board = this.boardElement?.nativeElement
    const pointerId = this.selectionPointerId
    this.selectionPointerId = undefined
    this.selectionStart = undefined
    this.selectionScreenStart = undefined
    this.selectionBox = undefined
    if (
      board &&
      pointerId !== undefined &&
      board.hasPointerCapture(pointerId)
    ) {
      board.releasePointerCapture(pointerId)
    }
  }

  private updateSelection(event: PointerEvent) {
    const start = this.selectionScreenStart
    if (!start) return
    const left = Math.min(start.x, event.clientX)
    const right = Math.max(start.x, event.clientX)
    const top = Math.min(start.y, event.clientY)
    const bottom = Math.max(start.y, event.clientY)
    const selected = new Set<string>()

    for (const drag of this.nodeDrags ?? []) {
      const rect = drag.element.nativeElement.getBoundingClientRect()
      if (
        rect.left <= right &&
        rect.right >= left &&
        rect.top <= bottom &&
        rect.bottom >= top
      ) {
        selected.add(drag.data)
      }
    }
    this.selectedNodeIds = selected
  }

  nodePointerDown(nodeId: string, event?: PointerEvent) {
    if (!this.selectedNodeIds.has(nodeId)) this.selectedNodeIds = new Set()
    const target = event?.target
    if (target instanceof Element && !target.closest(
      'input, textarea, select, button, a, label, [contenteditable], [role="textbox"]'
    )) {
      (event?.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>(
        '.node__header, .groupNode__header'
      )?.focus({ preventScroll: true })
    }
    this.activateNode(nodeId)
    this.panzoom.pauseDrag()
  }

  activateNode(nodeId: string) {
    this.activeNodeSelection.set({ storyId: this.activeStory.storyId(), nodeId })
  }

  private clearActiveNode() {
    this.activeNodeSelection.set(undefined)
  }

  focusNode(event: MouseEvent) {
    this.setNodeZIndex(event.currentTarget, 1)
  }
  blurNode(event: MouseEvent) {
    this.setNodeZIndex(event.currentTarget, 0)
  }
  nodeDragStarted(event: CdkDragStart<string>) {
    this.activateNode(event.source.data)
    this.setNodeZIndex(event.source.element.nativeElement, 1)
    if (
      !this.selectedNodeIds.has(event.source.data) ||
      this.selectedNodeIds.size < 2
    ) return

    const positions = new Map<string, Point>()
    const storyNodes = new Map(
      this.visibleNodes().map((node) => [node.id, node])
    )
    for (const drag of this.nodeDrags ?? []) {
      const storyNode = storyNodes.get(drag.data)
      if (storyNode && this.selectedNodeIds.has(drag.data)) {
        positions.set(drag.data, {
          x: Number(storyNode.left) || 0,
          y: Number(storyNode.top) || 0,
        })
      }
    }
    if (positions.size > 1) {
      this.groupDrag = {
        sourceId: event.source.data,
        positions,
        origin: positions.get(event.source.data)!,
      }
    }
  }

  frameDragStarted(event: CdkDragStart<string>, frame: boardFrame) {
    this.clearActiveNode()
    this.panzoom.pauseDrag()
    const members = new Set(frame.nodeIds)
    const positions = new Map<string, Point>()
    for (const storyNode of this.visibleNodes()) {
      if (members.has(storyNode.id)) {
        positions.set(storyNode.id, {
          x: Number(storyNode.left) || 0,
          y: Number(storyNode.top) || 0,
        })
      }
    }
    this.groupDrag = {
      sourceId: event.source.data,
      positions,
      origin: this.getFrameDragPosition(frame),
    }
  }

  frameDragEnded(event: CdkDragEnd<string>) {
    this.commitGroupDrag(event.source)
    this.groupDrag = undefined
    this.panzoom.resumeDrag()
    this.refreshFlows()
  }

  private frameAtDropPoint(dropPoint?: Point): boardFrame | undefined {
    if (!dropPoint || !this.boardElement) return undefined
    const point = this.getBoardPosition(dropPoint)
    // Frames later in the tree are painted above earlier frames.
    return [...this.visibleFrames()].reverse().find((frame) => {
      const bounds = this.frameBounds(frame)
      return point.x >= bounds.left && point.x <= bounds.left + bounds.width &&
        point.y >= bounds.top && point.y <= bounds.top + bounds.height
    })
  }

  private commitGroupDrag(source: CdkDrag<string>, frameId?: string) {
    const drag = this.groupDrag
    if (!drag || drag.sourceId !== source.data) return false
    const current = source.getFreeDragPosition()
    const dx = current.x - drag.origin.x
    const dy = current.y - drag.origin.y
    const positions = new Map<string, Point>()
    for (const [id, position] of drag.positions) {
      positions.set(id, { x: position.x + dx, y: position.y + dy })
    }
    this.storyEditor.updateNodePositions(
      positions,
      frameId ? { frameId, nodeIds: new Set(positions.keys()) } : undefined
    )
    return true
  }

  nodeDragEnded(event: CdkDragEnd<string>, storyNode: node) {
    const dragPosition = event.source.getFreeDragPosition()
    const frame = this.frameAtDropPoint(event.dropPoint)
    if (!this.commitGroupDrag(event.source, frame?.id)) {
      if (frame) {
        this.storyEditor.updateNodePositions(
          new Map([[storyNode.id, dragPosition]]),
          { frameId: frame.id, nodeIds: new Set([storyNode.id]) }
        )
      } else {
        this.storyEditor.updateNodePosition(
          storyNode.id,
          dragPosition.x,
          dragPosition.y
        )
      }
    }
    this.groupDrag = undefined
    this.panzoom.resumeDrag()
    this.boardFlows?.scheduleRefresh()
  }
  nodeDragCheck(event: CdkDragMove<string>) {
    if (this.groupDrag?.sourceId === event.source.data) {
      const current = event.source.getFreeDragPosition()
      const dx = current.x - this.groupDrag.origin.x
      const dy = current.y - this.groupDrag.origin.y
      for (const drag of this.nodeDrags ?? []) {
        if (drag === event.source) continue
        const start = this.groupDrag.positions.get(drag.data)
        if (start) drag.setFreeDragPosition({ x: start.x + dx, y: start.y + dy })
      }
    }
    this.boardFlows?.scheduleRefresh()
  }

  getNodeDragPosition(storyNode: node): Point {
    const left = Number(storyNode.left) || 0
    const top = Number(storyNode.top) || 0
    const cached = this.nodeDragPositions.get(storyNode.id)

    if (cached && cached.left === left && cached.top === top) {
      return cached.position
    }

    const position = { x: left, y: top }
    this.nodeDragPositions.set(storyNode.id, { left, top, position })

    return position
  }

  setActiveNode(nodeId: string, storyId: string) {
    this.activateNode(nodeId)
    this.preferences.setActiveNode(storyId, nodeId)
  }

  addNode(
    event: MouseEvent,
    type: 'text' | 'content' | 'distributor' | 'end'
  ): void {
    if (this.contextMenuActive) {
      this.contextMenuActive = false
      this.createNode(
        {
          top: this.contextMenuPosition.y,
          left: this.contextMenuPosition.x,
        },
        type
      )

      return
    }

    if (this.joinStroke) {
      const position = this.getBoardPosition(event)
      const newNodeInfo = this.createNode(
        { top: position.y, left: position.x },
        type
      )

      this.storyEditor.updateJoinOfOption(
        this.joinStroke.originId,
        newNodeInfo.id
      )
    }
  }

  createNode(
    position: { top: string | number; left: string | number },
    type: 'text' | 'content' | 'distributor' | 'end'
  ) {
    const newNodeInfo: node = {
      id: generateIDForNewNode(this.activeStory.entireTree().nodes),
      type,
      top: position.top,
      left: position.left,
      groupId: this.currentGroupId,
    }
    this.storyEditor.createNode(newNodeInfo)

    return newNodeInfo
  }

  duplicateNode(nodeId: string) {
    const idForNewNode = generateIDForNewNode(
      this.activeStory.entireTree().nodes
    )
    this.storyEditor.duplicateNode(nodeId, idForNewNode)
  }

  async removeNode(event: { nodeId: string }) {
    const image = this.storyEditor.getImageFromNode(event.nodeId)
    if (image) await this.storage.removeImage(image.path)

    this.storyEditor.removeNode(event.nodeId)
    this.selectedNodeIds.delete(event.nodeId)
    if (this.activeNodeId() === event.nodeId) this.clearActiveNode()

    const storyId = this.activeStory.storyId()
    if (this.preferences.getActiveNode(storyId) === event.nodeId) {
      this.preferences.setActiveNode(storyId, 'node_0')
    }
  }

  private getBoardPosition(event: BoardPoint) {
    const boardElement = this.boardElement?.nativeElement
    if (!boardElement) return { x: 0, y: 0 }

    const boardRect = boardElement.getBoundingClientRect()
    const scale = boardRect.width / boardElement.offsetWidth || 1
    return {
      x: (event.x - boardRect.left) / scale,
      y: (event.y - boardRect.top) / scale,
    }
  }

  private isInsideBoard(target: EventTarget | null | undefined) {
    return (
      target instanceof Node &&
      !!this.boardElement?.nativeElement.contains(target)
    )
  }

  private getJoinTarget(event: PointerEvent): BoardJoinTarget | undefined {
    const elementAtPointer = this.getElementAtPointer(event)
    const targetArea = elementAtPointer?.closest<HTMLElement>(
      '[data-board-join-node]'
    )
    const board = this.boardElement?.nativeElement
    if (!targetArea || !board?.contains(targetArea)) return undefined

    const nodeId = targetArea.dataset['boardJoinNode']
    const anchorId = targetArea.dataset['boardJoinAnchor']
    if (!nodeId || !anchorId) return undefined

    const anchor = this.anchorRegistry.get(anchorId)
    if (!anchor) return undefined

    return {
      nodeId,
      toAnswer: targetArea.dataset['boardJoinToAnswers'] === 'true',
      anchor,
    }
  }

  private getElementAtPointer(event: BoardPoint) {
    const element = document.elementFromPoint(event.x, event.y)
    return element ?? undefined
  }

  private getElementCenter(element: HTMLElement): BoardPoint {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  private setNodeZIndex(target: EventTarget | null, zIndex: number) {
    if (target instanceof HTMLElement) target.style.zIndex = String(zIndex)
  }
}
