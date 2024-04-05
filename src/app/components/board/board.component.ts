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

  // context menu
  contextMenuPosition = { x: 0, y: 0 }
  contextMenuActive = false
  @ViewChild('contextMenu', { static: true }) contextMenu!: ElementRef

  // Joins
  waitingForJoin: boolean = false
  willJoinId?: string
  joins: Array<any> = []

  throttled: any

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
        initialZoom: this.initialZoom || 1,
        zoomSpeed: 0.065,
        zoomDoubleClickSpeed: 1,
      }
    )
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault()

    this.contextMenuPosition.x = event.offsetX
    this.contextMenuPosition.y = event.offsetY

    this.contextMenuActive = true
  }

  public centerToNode(node: any) {
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
  }
  mouseLeave(event: any) {
    this.blurNode(event.target)
  }

  stopDragging() {
    this.sharedBoardService.boardReference.pause()
  }

  resumeDragging() {
    this.sharedBoardService.boardReference.resume()
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
    console.warn(answerId + ' will join')
    // Aqui es la primera i unica vegada que cambiem waitingForJoin
    setTimeout(() => {
      this.waitingForJoin = true
    }, 0)
    this.willJoinId = answerId
  }
  haveJoined(nodeId: string) {
    if (!this.willJoinId) return

    this.joins.push({
      origin: this.willJoinId + '_join',
      destiny: nodeId + '_join',
    })

    this.waitingForJoin = false

    this.activeStory.updateOptionJoin(this.willJoinId, nodeId)
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

  boardClick(event: any) {
    this.contextMenuActive = false
    this.addNode(event, 'content')
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

    if (this.waitingForJoin && this.willJoinId) {
      const newNodeInfo = this.createNode(
        { top: event.offsetY, left: event.offsetX },
        type
      )

      this.joins.push({
        origin: this.willJoinId + '_join',
        destiny: newNodeInfo.id + '_join',
      })

      this.activeStory.updateOptionJoin(this.willJoinId, newNodeInfo.id)

      this.waitingForJoin = false
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

  async removeNode(event: any) {
    // Remove join lines that go to the node
    this.joins = this.joins.filter(
      (join) => join.destiny !== event.nodeId + '_join'
    )

    // Remove join lines that go from the node
    if (event.answers) {
      this.joins = this.joins.filter(
        (join) =>
          !event.answers
            .map((answer: any) => answer + '_join')
            .includes(join.origin)
      )
    }

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
  }
}
