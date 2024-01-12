import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../../components/board/board.component'
import { MenuComponent } from '../../components/menu/menu.component'
import { DatabaseService } from '../../services/database.service'

@Component({
  selector: 'polo-dashboard',
  standalone: true,
  imports: [CommonModule, BoardComponent, MenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent {
  @ViewChild('board') board?: BoardComponent
  tree?: any
  id?: number
  trackingEnabled: boolean = false

  constructor(private db: DatabaseService) {}

  ngOnInit(): void {
    this.initBoard()
    this.updateTracking()
  }

  async updateTracking() {
    if (this.id) this.trackingEnabled = await this.db.getTrackingOf(this.id)
  }
  toggleTracking() {
    if (this.id) {
      this.trackingEnabled = !this.trackingEnabled
      this.db.setTrackingOf(this.id, this.trackingEnabled)
    }
  }

  async loadTree(treeId: number) {
    this.tree = await this.db.getTree(treeId)
    this.id = treeId

    localStorage.setItem('polo-id', treeId.toString())
    localStorage.setItem('polo-tree', JSON.stringify(this.tree))

    this.board?.centerToNode(this.tree.nodes[0])
    this.updateTracking()
  }

  initBoard() {
    // When there is local data, we use it
    if (localStorage.getItem('polo-id') && localStorage.getItem('polo-tree')) {
      //@ts-ignore
      const storedTree = JSON.parse(localStorage.getItem('polo-tree'))
      //@ts-ignore
      const storedTreeId = JSON.parse(localStorage.getItem('polo-id'))

      this.id = storedTreeId
      this.tree = storedTree

      return
    }
  }
}
