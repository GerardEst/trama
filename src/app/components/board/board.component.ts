import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NodeComponent } from '../node/node.component'
import createPanZoom from 'panzoom'
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop'
import { BoardFlowsComponent } from '../board-flows/board-flows.component'
import { StorageService } from 'src/app/services/storage.service'
import { combineTransforms } from 'src/app/utils/operations'
import { node } from 'src/app/interfaces'
import { DatabaseService } from 'src/app/services/database.service'

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
  @Input() treeId?: number

  // Joins
  waitingForJoin: boolean = false
  willJoinId?: string
  joins: Array<any> = []

  savingTree: boolean = false
  boardReference: any

  constructor(private storage: StorageService, private db: DatabaseService) {}

  ngOnChanges() {
    if (this.tree) this.drawJoins(this.tree.nodes)
  }

  ngAfterViewInit(): void {
    //https://github.com/anvaka/panzoom
    this.boardReference = createPanZoom(this.board?.nativeElement, {
      maxZoom: 1,
      minZoom: 0.5,
    })
    this.centerToNode(this.tree.nodes[0])
  }

  public centerToNode(node: any) {
    const finalX = -node.left + window.innerWidth / 2 - 100
    const finalY = -node.top + window.innerHeight / 2 - 200

    this.boardReference.moveTo(finalX, finalY)
  }

  focusNode(node: any) {
    node.style.zIndex = 1
  }
  blurNode(node: any) {
    node.style.zIndex = 0
  }
  dragEnabled() {
    this.boardReference.pause()
  }
  dragDisabled() {
    this.boardReference.resume()
  }
  mouseEnter(event: any) {
    this.dragEnabled()
    this.focusNode(event.target)
  }
  mouseLeave(event: any) {
    this.dragDisabled()
    this.blurNode(event.target)
  }
  dragStarted(event: any) {
    //this.focusNode(event)
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

    this.drawJoins(this.tree.nodes)
  }

  async saveToDb() {
    this.savingTree = true
    const resp = await this.db.saveLocalToDB()
    console.log('Saved?', resp)
    setTimeout(() => {
      this.savingTree = false
    }, 200)
  }

  drawJoins(nodes: Array<any>) {
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

    console.warn(nodeId + ' have joined ' + this.willJoinId)

    this.joins.push({
      origin: this.willJoinId + '_join',
      destiny: nodeId + '_join',
    })

    this.waitingForJoin = false

    this.storage.updateAnswerJoin(this.willJoinId, nodeId)
  }

  dragCheck() {}

  addNode(event: any) {
    if (!this.waitingForJoin || !this.willJoinId) return

    const newNodeInfo: node = {
      id: 'node_' + this.getIDForNewNode(),
      top: event.offsetY,
      left: event.offsetX,
    }
    this.tree.nodes.push(newNodeInfo)
    this.storage.createNode(newNodeInfo)

    this.joins.push({
      origin: this.willJoinId + '_join',
      destiny: newNodeInfo.id + '_join',
    })

    this.storage.updateAnswerJoin(this.willJoinId, newNodeInfo.id)

    this.waitingForJoin = false
  }

  exportTree() {
    //@ts-ignore
    navigator.clipboard.writeText(localStorage.getItem('polo'))
  }

  removeNode(event: any) {
    this.dragEnabled()

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
