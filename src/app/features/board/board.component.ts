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
} from '@angular/core'
import { NodeComponent } from './components/node/node.component'
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragMove,
  CdkDragStart,
  DragRef,
  Point,
} from '@angular/cdk/drag-drop'
import { BoardFlowsComponent } from './components/board-flows/board-flows.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { node } from 'src/app/core/interfaces/interfaces'
import { PanzoomService } from 'src/app/features/board/services/panzoom.service'
import { generateIDForNewNode } from 'src/app/shared/utils/tree-searching'
import { StoryEditorService } from './services/story-editor.service'
import { BoardAnchorRegistryService } from './services/board-anchor-registry.service'
import { BoardPreferencesService } from './services/board-preferences.service'
import { StorageService } from 'src/app/shared/services/storage.service'
import { BoardJoinStroke, BoardPoint } from './board-interactions'

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
    BoardFlowsComponent,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PanzoomService, BoardAnchorRegistryService],
})
export class BoardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('board') boardElement?: ElementRef<HTMLElement>
  @ViewChild(BoardFlowsComponent) boardFlows?: BoardFlowsComponent
  @ViewChildren(CdkDrag) nodeDrags?: QueryList<CdkDrag<string>>

  @Input() grid?: boolean
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
  selectedNodeIds = new Set<string>()
  selectionBox?: { left: number; top: number; width: number; height: number }
  private selectionPointerId?: number
  private selectionStart?: BoardPoint
  private selectionScreenStart?: BoardPoint
  private groupDrag?: {
    sourceId: string
    positions: Map<string, Point>
  }
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

  @HostListener('document:keydown.escape')
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

    this.panzoom.centerToNode(node)
  }

  public goTo(x: number, y: number) {
    this.panzoom.goTo(x, y)
  }

  public refreshFlows() {
    this.boardFlows?.scheduleRefresh()
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
      } else if (this.isInsideBoard(elementAtPointer)) {
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

  nodePointerDown(nodeId: string) {
    if (!this.selectedNodeIds.has(nodeId)) this.selectedNodeIds = new Set()
    this.panzoom.pauseDrag()
  }

  focusNode(event: MouseEvent) {
    this.setNodeZIndex(event.currentTarget, 1)
  }
  blurNode(event: MouseEvent) {
    this.setNodeZIndex(event.currentTarget, 0)
  }
  nodeDragStarted(event: CdkDragStart<string>) {
    this.setNodeZIndex(event.source.element.nativeElement, 1)
    if (
      !this.selectedNodeIds.has(event.source.data) ||
      this.selectedNodeIds.size < 2
    ) return

    const positions = new Map<string, Point>()
    const storyNodes = new Map(
      this.activeStory.entireTree().nodes.map((node) => [node.id, node])
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
      this.groupDrag = { sourceId: event.source.data, positions }
    }
  }
  nodeDragEnded(event: CdkDragEnd<string>, storyNode: node) {
    const dragPosition = event.source.getFreeDragPosition()
    if (this.groupDrag?.sourceId === storyNode.id) {
      const initial = this.groupDrag.positions.get(storyNode.id)!
      const dx = dragPosition.x - initial.x
      const dy = dragPosition.y - initial.y
      const positions = new Map<string, Point>()
      for (const [id, position] of this.groupDrag.positions) {
        positions.set(id, { x: position.x + dx, y: position.y + dy })
      }
      this.storyEditor.updateNodePositions(positions)
    } else {
      this.storyEditor.updateNodePosition(
        storyNode.id,
        dragPosition.x,
        dragPosition.y
      )
    }
    this.groupDrag = undefined
    this.panzoom.resumeDrag()
    this.boardFlows?.scheduleRefresh()
  }
  nodeDragCheck(event: CdkDragMove<string>) {
    if (this.groupDrag?.sourceId === event.source.data) {
      const sourceStart = this.groupDrag.positions.get(event.source.data)!
      const current = event.source.getFreeDragPosition()
      const dx = current.x - sourceStart.x
      const dy = current.y - sourceStart.y
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
