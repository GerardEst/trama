import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../../components/board/board.component'
import { MenuComponent } from '../../components/menu/menu.component'
import { DatabaseService } from '../../services/database.service'
import { TreeErrorFinderService } from 'src/app/services/tree-error-finder.service'
import { MenuTopComponent } from 'src/app/components/menu-top/menu-top.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { MenuTreeLegendComponent } from 'src/app/components/menu-tree-legend/menu-tree-legend.component'
import { configuration } from 'src/app/services/database-interfaces'

@Component({
  selector: 'polo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BoardComponent,
    MenuComponent,
    MenuTopComponent,
    MenuTreeLegendComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent {
  @ViewChild('board') board?: BoardComponent
  @ViewChild('menuTop') menuTop?: MenuTopComponent
  tree?: any
  id?: string
  savingTree: boolean = false

  constructor(
    private db: DatabaseService,
    private errorFider: TreeErrorFinderService,
    private activeStory: ActiveStoryService
  ) {}

  ngOnInit(): void {
    this.initBoard()
    this.errorFider.checkErrors(this.tree)
  }

  async loadTree(treeId: string) {
    const story = await this.db.getTree(treeId)

    this.tree = story.tree
    this.id = treeId

    localStorage.setItem('polo-id', treeId)
    localStorage.setItem('polo-tree', JSON.stringify(this.tree))
    localStorage.setItem('polo-name', story.name)

    // Set active-story state
    this.activeStory.storyId.set(this.id)
    this.activeStory.entireTree = this.tree
    this.activeStory.storyName.set(story.name)
    this.activeStory.initTreeRefs(this.tree)

    this.updateConfiguration()

    this.board?.centerToNode(this.tree.nodes[0])

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

      // Set active-story state
      this.activeStory.storyId.set(this.id)
      this.activeStory.entireTree = this.tree
      this.activeStory.storyName.set(localTreeName || '')
      this.activeStory.initTreeRefs(this.tree)

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

      sessionStorage.setItem('polo-session', 'true')
    }

    this.updateConfiguration()
  }

  async updateConfiguration() {
    if (this.id) {
      const configuration: configuration = await this.db.getConfigurationOf(
        this.id
      )

      this.activeStory.storyConfiguration().tracking = configuration.tracking
      this.activeStory.storyConfiguration().sharing = configuration.sharing
      this.activeStory.storyConfiguration().askName = configuration.askName
      this.activeStory.storyConfiguration().cumulativeView =
        configuration.cumulativeView
    }
  }
}
