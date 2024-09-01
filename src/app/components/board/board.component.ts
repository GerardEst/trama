import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NodeComponent } from '../node/node.component'
import createPanZoom from 'panzoom'
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop'
import { BoardFlowsComponent } from '../board-flows/board-flows.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { combineTransforms } from 'src/app/utils/operations'
import { node } from 'src/app/interfaces'
import { SharedBoardService } from 'src/app/components/board/board-utils.service'
import { DatabaseService } from 'src/app/services/database.service'
import { generateIDForNewNode } from 'src/app/utils/tree-searching'

@Component({
  selector: 'polo-board',
  standalone: true,
  imports: [
    CommonModule,
    NodeComponent,
    CdkDrag,
    CdkDragHandle,
    BoardFlowsComponent,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.sass'],
})
export class BoardComponent {
  @ViewChild('board') board?: ElementRef

  @Input() grid?: boolean
  @Input() initialZoom?: number
  @Input() focusElements: boolean = true
  @Input() zoomable: boolean = true

  // context menu
  contextMenuPosition = { x: 0, y: 0 }
  contextMenuActive = false
  @ViewChild('contextMenu', { static: true }) contextMenu!: ElementRef

  // Joins
  willJoinId?: string
  isDrawingJoin?: boolean = false
  throttled: any
  hoveringNode?: any

  // For the drags
  isMouseDown: boolean = false
  isDragging: boolean = false
  dragStartedOn?: any
  dragMouseOn?: any

  constructor(
    public activeStory: ActiveStoryService,
    private sharedBoardService: SharedBoardService,
    private database: DatabaseService
  ) {}

  ngOnInit() {
    // Sets if the board elements should focus on create or not (for the landing page)
    this.sharedBoardService.focusElements = this.focusElements
  }

  ngAfterViewInit(): void {
    //https://github.com/anvaka/panzoom
    this.sharedBoardService.boardReference = createPanZoom(
      this.board?.nativeElement,
      {
        maxZoom: 1,
        minZoom: 0.4,
        filterKey: function (/* e, dx, dy, dz */) {
          // don't let panzoom handle this event:
          return true
        },
        beforeWheel: (e) => {
          if (this.zoomable) return
          // allow wheel-zoom only if altKey is down. Otherwise - ignore
          var shouldIgnore = !e.altKey
          return shouldIgnore
        },
        initialZoom: this.initialZoom || 1,
        zoomSpeed: 0.065,
        zoomDoubleClickSpeed: 1,
      }
    )
  }

  checkDragStart(event: any) {
    this.isMouseDown = true

    // Mirem si ha començat dins un joiner
    const join = event.target.classList.contains('union_point')
    const answerId =
      event.target.closest('polo-condition')?.id ||
      event.target.closest('polo-answer')?.id ||
      event.target.closest('polo-node')?.id

    if (join) {
      this.isDrawingJoin = true
      this.willJoin(answerId)
      this.dragStartedOn = event.target
    }
  }

  checkDrag(event: any) {
    if (this.isMouseDown && this.willJoinId) {
      this.isDragging = true

      const hoverOnNodePart =
        event.target.closest('.node__answers') || event.target.closest('.node')
      const joinerOnPart = hoverOnNodePart?.querySelector('.joiner')

      this.dragMouseOn = joinerOnPart || {
        left: event.offsetX,
        top: event.offsetY,
      }
    }
  }

  checkDragStop(event: any) {
    this.isMouseDown = false
    this.isDragging = false
    this.dragStartedOn = undefined

    console.log('Stop dragging (if we were dragging)')

    if (this.isDrawingJoin) {
      if (this.hoveringNode) {
        this.haveJoined({
          id: this.hoveringNode.id,
          type: this.dragMouseOn.classList.contains('joiner--answers')
            ? 'answers'
            : 'node',
        })
      } else {
        this.addNode(event, 'content')
      }
      this.willJoinId = undefined
      this.isDrawingJoin = false
    }

    this.dragMouseOn = undefined
    // Resume dragging
    this.sharedBoardService.boardReference.resume()
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault()

    this.contextMenuPosition.x = event.offsetX
    this.contextMenuPosition.y = event.offsetY

    this.contextMenuActive = true
  }

  public centerToNode(node: any) {
    if (!node) return
    // Here we should calculate the correct transform taken into account the zoom level
    // Now it "works" but it's not perfect
    const scale = this.sharedBoardService.boardReference.getTransform().scale

    const finalX = (-node.left + window.innerWidth / 2 - 100) * scale
    const finalY = (-node.top + window.innerHeight / 2 - 200) * scale

    this.sharedBoardService.boardReference.moveTo(finalX, finalY)
  }

  focusNode(node: any) {
    node.style.zIndex = 1
  }
  blurNode(node: any) {
    node.style.zIndex = 0
  }
  mouseEnter(event: any) {
    this.focusNode(event.target)

    // Si estem fent drag, el mouseEnter i leave ens han de servir per anar sabent on està el ratolí
    this.hoveringNode = event.target
  }
  mouseLeave(event: any) {
    this.blurNode(event.target)

    this.hoveringNode = undefined
  }

  stopDragging() {
    this.sharedBoardService.boardReference.pause()
  }

  dragStarted(event: any) {
    this.focusNode(event.source.element.nativeElement)
  }

  dragReleased(event: any) {
    const currentTransform = event.source.getRootElement().style.transform
    const finalTransform = combineTransforms(currentTransform)

    event.source.getRootElement().style.transform = `translate3d(${finalTransform.x}px, ${finalTransform.y}px, 0}px)`

    this.activeStory.updateNodePosition(
      event.source.getRootElement().id,
      finalTransform.x,
      finalTransform.y
    )
  }

  willJoin(answerId: string) {
    console.log(answerId + ' will join')

    this.willJoinId = answerId
  }
  haveJoined({ id: nodeId, type }: { id: string; type: 'answers' | 'node' }) {
    if (!this.willJoinId) return

    this.activeStory.updateJoinOfOption(
      this.willJoinId,
      nodeId,
      type === 'answers'
    )

    console.log('current tree:', this.activeStory.entireTree())
  }

  // Simple throttling to prevent call treeChanges too many times when dragging
  timer: any = null
  dragCheck() {
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.activeStory.activateTreeChangeEffects()
        this.timer = null
      }, 10)
    }
  }

  setActiveNode(nodeId: string, storyId: string) {
    const storedActiveNodes = localStorage.getItem('polo-activeNodes')
    const activeNodes =
      (storedActiveNodes && JSON.parse(storedActiveNodes)) || {}

    activeNodes[storyId] = nodeId

    localStorage.setItem('polo-activeNodes', JSON.stringify(activeNodes))
  }

  addNode(event: any, type: 'content' | 'distributor' | 'end'): void {
    if (this.contextMenuActive) {
      this.contextMenuActive = false
      this.createNode(
        {
          top: this.contextMenu.nativeElement.style.top.slice(0, -2),
          left: this.contextMenu.nativeElement.style.left.slice(0, -2),
        },
        type
      )

      return
    }

    if (this.willJoinId) {
      const newNodeInfo = this.createNode(
        { top: event.offsetY, left: event.offsetX },
        type
      )

      this.activeStory.updateJoinOfOption(this.willJoinId, newNodeInfo.id)
    }
  }

  createNode(
    position: { top: string; left: string },
    type: 'content' | 'distributor' | 'end'
  ) {
    const newNodeInfo: node = {
      id: generateIDForNewNode(this.activeStory.entireTree().nodes),
      type,
      top: position.top,
      left: position.left,
    }
    this.activeStory.createNode(newNodeInfo)

    return newNodeInfo
  }

  async duplicateNode(event: any) {
    const idForNewNode = generateIDForNewNode(
      this.activeStory.entireTree().nodes
    )
    this.activeStory.duplicateNode(event, idForNewNode)
  }

  async removeNode(event: any) {
    console.log('Try to remove node ', event)

    // Remove node image from db
    const image = this.activeStory.getImageFromNode(event.nodeId)
    if (image) {
      const { data, error } = await this.database.supabase.storage
        .from('images')
        .remove([image.path])
      if (error) console.log(error)
    }

    // remove node from tree
    this.activeStory.removeNode(event.nodeId)

    // change active node from localstorage
    const currentActiveNodes = localStorage.getItem('polo-activeNodes')
    if (currentActiveNodes) {
      const currentActiveNode =
        JSON.parse(currentActiveNodes)[this.activeStory.storyId()]
      if (currentActiveNode === event.nodeId) {
        this.setActiveNode('node_0', this.activeStory.storyId())
      }
    }
  }
}
