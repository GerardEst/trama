import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  HostListener,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { NodeComponent } from './components/node/node.component'
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop'
import { BoardFlowsComponent } from './components/board-flows/board-flows.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { combineTransforms } from 'src/app/features/dashboard/utils/operations'
import { node } from 'src/app/core/interfaces/interfaces'
import { PanzoomService } from 'src/app/features/board/services/panzoom.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { generateIDForNewNode } from 'src/app/shared/utils/tree-searching'

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
  @ViewChild('board') boardElement?: ElementRef

  @Input() grid?: boolean
  @Input() initialZoom?: number
  @Input() focusElements: boolean = true
  @Input() initialPosition: { x: number; y: number } = { x: 0, y: 0 }
  @Input() zoomable: boolean = true

  nodeDragThrottle: any = null

  // Context menu
  contextMenuPosition = { x: 0, y: 0 }
  contextMenuActive = false
  @ViewChild('contextMenu', { static: true }) contextMenu!: ElementRef

  // Drags to join
  isMouseDown: boolean = false
  isDrawingJoin?: boolean = false
  throttled: any
  dragStartedOn?: any
  dragMouseOn?: any

  @HostListener('keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.isDrawingJoin) {
      this.stopDragging()
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
      } else {
        this.openContextMenu(event)
      }
    }
  }

  constructor(
    public panzoom: PanzoomService,
    public activeStory: ActiveStoryService,
    private database: DatabaseService
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

  public centerToNode(node: any) {
    if (!node) return

    this.panzoom.centerToNode(node)
  }

  public goTo(x:number,y:number) {
    this.panzoom.goTo(x, y)
  }

  openContextMenu(event: MouseEvent) {
    event.preventDefault()

    this.contextMenuPosition.x = event.offsetX
    this.contextMenuPosition.y = event.offsetY

    this.contextMenuActive = true
  }

  closeContextMenu() {
    this.contextMenuActive = false
  }

  checkDragStart(event: any) {
    this.isMouseDown = true

    // Mirem si ha començat dins un joiner
    const join = event.target.classList.contains('union_point')

    if (join) {
      this.isDrawingJoin = true
      this.dragStartedOn = event.target
    }
  }

  checkDrag(event: any) {
    if (this.isMouseDown && this.dragStartedOn) {
      // Mira si estem passant per sobre un node o les seves answers
      const hoverOnNodePart =
        event.target.closest('.node__answers') || event.target.closest('.node')
      const joinerOnPart = hoverOnNodePart?.querySelector('.joiner')

      // Si no estem sobre la part d'un node, passem la posició del ratolí
      this.dragMouseOn = joinerOnPart || event
    }
  }

  checkDragStop(event: any) {
    // Ignore if it's not the left mouse button
    if (event.button !== 0) return

    this.isMouseDown = false

    const isNotInTheSamePlaceItStarted = event.target !== this.dragStartedOn

    if (this.isDrawingJoin && isNotInTheSamePlaceItStarted) {
      if (this.dragMouseOn instanceof HTMLElement) {
        const nodeId = this.dragMouseOn.closest('polo-node')?.id
        if (!nodeId) return

        const originId =
          this.dragStartedOn.closest('polo-answer')?.id ||
          this.dragStartedOn.closest('polo-condition')?.id ||
          this.dragStartedOn.closest('polo-node')?.id

        this.activeStory.updateJoinOfOption(
          originId,
          nodeId,
          this.dragMouseOn.classList.contains('joiner--answers')
        )
        console.log('current tree:', this.activeStory.entireTree())
      } else {
        this.addNode(event, 'content')
      }
    }

    this.stopDragging()

    this.panzoom.resumeDrag()
  }

  stopDragging() {
    this.dragStartedOn = undefined
    this.dragMouseOn = undefined
    this.isDrawingJoin = false
  }

  focusNode(event: any) {
    if (event.target) event.target.style.zIndex = 1
  }
  blurNode(event: any) {
    if (event.target) event.target.style.zIndex = 0
  }
  nodeDragStarted(event: any) {
    this.focusNode(event.source.element.nativeElement)
  }
  nodeDragReleased(event: any) {
    const currentTransform = event.source.getRootElement().style.transform
    const finalTransform = combineTransforms(currentTransform)

    event.source.getRootElement().style.transform = `translate3d(${finalTransform.x}px, ${finalTransform.y}px, 0}px)`

    this.activeStory.updateNodePosition(
      event.source.getRootElement().id,
      finalTransform.x,
      finalTransform.y
    )
  }
  nodeDragCheck() {
    if (!this.nodeDragThrottle) {
      this.nodeDragThrottle = setTimeout(() => {
        this.activeStory.activateTreeChangeEffects()
        this.nodeDragThrottle = null
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

  addNode(event: any, type: 'text' | 'content' | 'distributor' | 'end'): void {
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

    if (this.dragStartedOn) {
      const newNodeInfo = this.createNode(
        { top: event.offsetY, left: event.offsetX },
        type
      )

      const originId =
        this.dragStartedOn.closest('polo-answer')?.id ||
        this.dragStartedOn.closest('polo-condition')?.id ||
        this.dragStartedOn.closest('polo-node')?.id

      this.activeStory.updateJoinOfOption(originId, newNodeInfo.id)
    }
  }

  createNode(
    position: { top: string; left: string },
    type: 'text' | 'content' | 'distributor' | 'end'
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
