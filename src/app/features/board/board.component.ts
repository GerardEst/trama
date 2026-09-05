import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  HostListener,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core'
import { NodeComponent } from './components/node/node.component'
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
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
    CdkDragHandle,
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
    if (this.isDrawingJoin) {
      this.stopDragging()
      this.panzoom.resumeDrag()
    }
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

    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const origin = target.closest<HTMLElement>('[data-board-origin]')
    const originId = origin?.dataset['boardOrigin']
    const board = this.boardElement?.nativeElement
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
    if (!this.joinStroke || event.pointerId !== this.joinPointerId) return

    const joinTarget = this.getJoinTarget(event)
    const to = joinTarget
      ? this.getElementCenter(joinTarget.anchor)
      : { x: event.clientX, y: event.clientY }

    this.joinStroke = { ...this.joinStroke, to }
  }

  checkDragStop(event: PointerEvent) {
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

  focusNode(event: MouseEvent) {
    this.setNodeZIndex(event.currentTarget, 1)
  }
  blurNode(event: MouseEvent) {
    this.setNodeZIndex(event.currentTarget, 0)
  }
  nodeDragStarted(event: CdkDragStart) {
    this.setNodeZIndex(event.source.element.nativeElement, 1)
  }
  nodeDragEnded(event: CdkDragEnd, storyNode: node) {
    const dragPosition = event.source.getFreeDragPosition()
    event.source.reset()
    this.storyEditor.updateNodePosition(
      storyNode.id,
      Number(storyNode.left) + dragPosition.x,
      Number(storyNode.top) + dragPosition.y
    )
    this.panzoom.resumeDrag()
    this.boardFlows?.scheduleRefresh()
  }
  nodeDragCheck() {
    this.boardFlows?.scheduleRefresh()
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
