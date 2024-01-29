import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../../components/board/board.component'
import { MenuComponent } from '../../components/menu/menu.component'
import { DatabaseService } from '../../services/database.service'
import { Router } from '@angular/router'
import { TreeErrorNotifierComponent } from 'src/app/components/tree-error-notifier/tree-error-notifier.component'
import { TreeErrorFinderService } from 'src/app/services/tree-error-finder.service'
import { MenuTopComponent } from 'src/app/components/menu-top/menu-top.component'

@Component({
  selector: 'polo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BoardComponent,
    MenuComponent,
    TreeErrorNotifierComponent,
    MenuTopComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent {
  @ViewChild('board') board?: BoardComponent
  tree?: any
  id?: string
  name?: string
  trackingEnabled: boolean = false
  bookviewEnabled: boolean = false
  savingTree: boolean = false

  constructor(
    private db: DatabaseService,
    private router: Router,
    private errorFider: TreeErrorFinderService
  ) {}

  ngOnInit(): void {
    this.initBoard()
    this.updateConfiguration()
    this.errorFider.checkErrors(this.tree)
  }

  async updateConfiguration() {
    if (this.id) {
      const configuration = await this.db.getConfigurationOf(this.id)
      this.trackingEnabled = configuration.tracking
      this.bookviewEnabled = configuration.view === 'book'
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
      this.db.setBookviewOf(this.id, this.bookviewEnabled ? 'book' : null)
    }
  }

  async goToPlayground() {
    //await this.saveToDb()
    window.open('/playground/' + this.id, '_blank')
  }

  async openStadistics() {
    this.router.navigate(['/stadistics', this.id])
  }

  exportTree() {
    //@ts-ignore
    navigator.clipboard.writeText(localStorage.getItem('polo-tree'))
  }

  async loadTree(treeId: string) {
    const story = await this.db.getTree(treeId)
    this.tree = story.tree
    this.id = treeId
    this.name = story.name

    localStorage.setItem('polo-id', treeId)
    localStorage.setItem('polo-tree', JSON.stringify(this.tree))
    localStorage.setItem('polo-name', story.name)

    this.board?.centerToNode(this.tree.nodes[0])
    this.updateConfiguration()

    this.errorFider.checkErrors(this.tree)
  }

  initBoard() {
    const currentSession = sessionStorage.getItem('polo-session')
    const localTree = localStorage.getItem('polo-tree')
    const localTreeId = localStorage.getItem('polo-id')
    const localTreeName = localStorage.getItem('polo-name')

    if (currentSession && localTreeId && localTree) {
      console.log('Tree loaded from local')

      // When there is local data, and we are in the same session, we use local data
      this.id = localTreeId
      this.tree = JSON.parse(localTree)
      this.name = localTreeName || ''
      // this.board?.centerToNode(this.tree.nodes[0])
    } else if (!currentSession && localTreeId) {
      console.warn('Tree loaded from db')

      // When there is local data, but we are not in the same session, we use the db data to load the local tree
      this.loadTree(localTreeId)
      sessionStorage.setItem('polo-session', 'true')
    } else {
      console.warn('Tree not loaded')

      this.tree = undefined
      this.id = undefined
      this.name = undefined
      sessionStorage.setItem('polo-session', 'true')
    }
  }
}
