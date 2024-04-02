import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../../components/board/board.component'
import { MenuComponent } from '../../components/menu/menu.component'
import { DatabaseService } from '../../services/database.service'
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
    public activeStory: ActiveStoryService
  ) {}

  ngOnInit(): void {
    this.initBoard()
  }

  async loadTree(treeId: string) {
    const story = await this.db.getTree(treeId)

    localStorage.setItem('polo-id', treeId)

    // Set active-story state
    this.activeStory.storyId.set(treeId)
    this.activeStory.entireTree = story.tree
    this.activeStory.storyName.set(story.name)
    this.activeStory.initTreeRefs(story.tree)

    this.updateConfiguration()

    // Update the board
    this.id = treeId
    this.board?.centerToNode(story.tree.nodes[0])
  }

  initBoard() {
    const localTreeId = localStorage.getItem('polo-id')

    if (localTreeId) {
      this.loadTree(localTreeId)
    } else {
      // TODO -> Create a new tree
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
