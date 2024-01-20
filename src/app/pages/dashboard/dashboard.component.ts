import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../../components/board/board.component'
import { MenuComponent } from '../../components/menu/menu.component'
import { DatabaseService } from '../../services/database.service'
import { Router } from '@angular/router'

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
  bookviewEnabled: boolean = false
  savingTree: boolean = false

  constructor(private db: DatabaseService, private router: Router) {}

  ngOnInit(): void {
    this.initBoard()
    this.updateTracking()
  }

  async updateTracking() {
    if (this.id) {
      const configuration = await this.db.getConfigurationOf(this.id)
      this.trackingEnabled = configuration.tracking
    }
  }
  toggleTracking() {
    if (this.id) {
      this.trackingEnabled = !this.trackingEnabled
      this.db.setTrackingOf(this.id, this.trackingEnabled)
    }
  }
  toggleBookview() {
    if (this.id) {
      this.bookviewEnabled = !this.bookviewEnabled
      this.db.setBookviewOf(this.id, this.bookviewEnabled)
    }
  }

  goToPlayground() {
    window.open('/playground/' + this.id, '_blank')
  }

  async openStadistics() {
    this.router.navigate(['/stadistics', this.id])
  }

  async saveToDb() {
    this.savingTree = true
    const resp = await this.db.saveLocalToDB()
    console.log('Saved?', resp)
    setTimeout(() => {
      this.savingTree = false
    }, 200)
  }

  exportTree() {
    //@ts-ignore
    navigator.clipboard.writeText(localStorage.getItem('polo-tree'))
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
    const currentSession = sessionStorage.getItem('polo-session')
    const localTree = localStorage.getItem('polo-tree')
    const localTreeId = localStorage.getItem('polo-id')

    if (currentSession && localTreeId && localTree) {
      console.log('Tree loaded from local')

      // When there is local data, and we are in the same session, we use local data
      this.id = JSON.parse(localTreeId)
      this.tree = JSON.parse(localTree)
      // this.board?.centerToNode(this.tree.nodes[0])
    } else if (!currentSession && localTreeId) {
      console.warn('Tree loaded from db')

      // When there is local data, but we are not in the same session, we use the db data to load the local tree
      this.loadTree(JSON.parse(localTreeId))
      sessionStorage.setItem('polo-session', 'true')
    } else {
      console.warn('Tree not loaded')

      this.tree = undefined
      this.id = undefined
      sessionStorage.setItem('polo-session', 'true')
    }
  }

  logout() {
    this.db.supabase.auth.signOut()
    this.router.navigate(['/login'])
  }
}
