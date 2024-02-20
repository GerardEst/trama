import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NodeComponent } from '../node/node.component'
import createPanZoom from 'panzoom'
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop'
import { BoardFlowsComponent } from '../board-flows/board-flows.component'
import { StorageService } from 'src/app/services/storage.service'
import { combineTransforms } from 'src/app/utils/operations'
import { node } from 'src/app/modules/marco/interfaces'
import { SharedBoardService } from 'src/app/services/shared-board-service'
import { findAnswerInTree } from 'src/app/utils/tree-searching'

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
  @Input() tree?: any
  @Input() treeId?: string

  // context menu
  contextMenuPosition = { x: 0, y: 0 }
  contextMenuActive = false
  @ViewChild('contextMenu', { static: true }) contextMenu!: ElementRef

  // Joins
  waitingForJoin: boolean = false
  willJoinId?: string
  joins: Array<any> = []

  constructor(
    private storage: StorageService,
    private sharedBoardService: SharedBoardService
  ) {}

  ngOnInit() {
    this.sharedBoardService.updatedJoins.subscribe((joinsData: any) => {
      const answer = findAnswerInTree(joinsData.answerId, this.tree)
      answer[0].join = joinsData.joins
      this.calculateJoins(this.tree.nodes)
    })
  }

  ngOnChanges() {
    if (this.tree) this.calculateJoins(this.tree?.nodes)
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
        zoomSpeed: 0.065,
      }
    )
    if (this.tree) {
      const activeNode = this.tree.nodes.find(
        (node: node) => node.id === localStorage.getItem('polo-activeNode')
      )
      this.centerToNode(activeNode || this.tree.nodes[0])
    }
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault()

    this.contextMenuPosition.x = event.offsetX
    this.contextMenuPosition.y = event.offsetY

    this.contextMenuActive = true
  }

  public centerToNode(node: any) {
    console.log(node)
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
    this.sharedBoardService.boardReference.pause()
    this.focusNode(event.target)
  }
  mouseLeave(event: any) {
    this.sharedBoardService.boardReference.resume()
    this.blurNode(event.target)
  }
  dragStarted(event: any) {
    this.focusNode(event.source.element.nativeElement)
  }
  dragReleased(event: any) {
    const currentTransform = event.source.getRootElement().style.transform
    const finalTransform = combineTransforms(currentTransform)

    event.source.getRootElement().style.transform = `translate3d(${finalTransform.x}px, ${finalTransform.y}px, 0}px)`

    this.storage.updateNodePosition(
      event.source.getRootElement().id,
      finalTransform.x,
      finalTransform.y
    )
  }

  calculateJoins(nodes: Array<any>) {
    /** TODO -> Replantejar això. No té sentit calcular absolutament totes les linies cada vegada que es mou algo
     * Mes endavant segurament donarà problemes de rendiment
     */
    this.joins = []
    for (let node of nodes) {
      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.join) {
            for (let join of answer.join) {
              // Aqui ara tinc un array d'obj, l'id esta a la prop node
              this.joins.push({
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
              this.joins.push({
                origin: condition.id + '_join',
                destiny: join.node + '_join',
              })
            }
          }
        }
      }
      if (node.fallbackCondition) {
        if (node.fallbackCondition.join) {
          for (let join of node.fallbackCondition.join) {
            this.joins.push({
              origin: node.fallbackCondition.id + '_join',
              destiny: join.node + '_join',
            })
          }
        }
      }
    }
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

    this.storage.updateOptionJoin(this.willJoinId, nodeId)
  }

  dragCheck() {}

  boardClick(event: any) {
    this.contextMenuActive = false
    this.addNode(event, 'content')
  }

  setActiveNode(nodeId: string) {
    localStorage.setItem('polo-activeNode', nodeId)
  }

  addNode(event: any, type: 'content' | 'distributor' | 'end'): void {
    event.stopPropagation()

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

      this.storage.updateOptionJoin(this.willJoinId, newNodeInfo.id)

      this.waitingForJoin = false
    }
  }

  createNode(
    position: { top: string; left: string },
    type: 'content' | 'distributor' | 'end'
  ) {
    console.log('new ' + type + ' node')

    const newNodeInfo: node = {
      id: 'node_' + this.getIDForNewNode(),
      type,
      top: position.top,
      left: position.left,
    }
    this.tree.nodes.push(newNodeInfo)
    this.storage.createNode(newNodeInfo)

    return newNodeInfo
  }

  removeNode(event: any) {
    // Remove node from tree
    this.tree.nodes = this.tree.nodes.filter(
      (node: any) => node.id !== event.nodeId
    )

    // Remove joins that go to the node
    this.joins = this.joins.filter(
      (join) => join.destiny !== event.nodeId + '_join'
    )

    // Remove joins that go from the node
    if (event.answers) {
      this.joins = this.joins.filter(
        (join) =>
          !event.answers
            .map((answer: any) => answer + '_join')
            .includes(join.origin)
      )
    }

    this.storage.removeNode(event.nodeId, event.answers)
  }

  getIDForNewNode() {
    const node_ids = []

    if (!this.tree.nodes) return 0

    for (let node of this.tree.nodes) node_ids.push(node.id.split('_')[1])
    const great_id = Math.max(...node_ids) > 0 ? Math.max(...node_ids) : 0

    return great_id + 1
  }
}
