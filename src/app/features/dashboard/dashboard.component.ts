import { Component, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../board/board.component'
import { MenuComponent } from './components/menu/menu.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { MenuTopComponent } from 'src/app/features/dashboard/components/menu-top/menu-top.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { MenuTreeLegendComponent } from './components/menu-tree-legend/menu-tree-legend.component'
import { findNodeInTree } from 'src/app/shared/utils/tree-searching'
import { StadisticsService } from 'src/app/shared/services/stadistics.service'

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

  id?: string
  savingTree: boolean = false

  constructor(
    private db: DatabaseService,
    public activeStory: ActiveStoryService,
    private stadistics: StadisticsService
  ) {}

  ngOnInit(): void {
    // If there is some tree reference in localstorage, load that one
    const localStoryId = localStorage.getItem('polo-id')
    this.initBoard(localStoryId)
  }

  async initBoard(storyId: string | null) {
    if (storyId) {
      const story = await this.db.getStoryWithID(storyId)
      if (story) this.loadStory(story)
    } else {
      const story = await this.db.getNewestStory()
      if (story) this.loadStory(story)
    }
  }

  loadStory(story: any) {
    localStorage.setItem('polo-id', story.id)

    // Set active-story states
    this.activeStory.storyId.set(story.id)
    this.activeStory.entireTree.set(story.tree)
    this.activeStory.storyName.set(story.name)

    this.stadistics.clean()
    this.activeStory.initTreeRefs()
    this.setInitialBoardPositionFor(story.id)

    setTimeout(() => this.activeStory.activateTreeChangeEffects(), 0)

    this.loadConfigurationForStory(story.id)
  }

  setInitialBoardPositionFor(storyId: string) {
    const activeNodes = localStorage.getItem('polo-activeNodes')
    const activeNodeId = activeNodes && JSON.parse(activeNodes)[storyId]
    if (activeNodeId) {
      const activeNode = findNodeInTree(
        activeNodeId,
        this.activeStory.entireTree()
      )
      this.board?.centerToNode(activeNode)
    } else {
      this.board?.centerToNode(this.activeStory.entireTree().nodes[0])
    }
  }

  async loadConfigurationForStory(storyId: string) {
    const configuration: any = await this.db.getConfigurationOf(storyId)

    this.activeStory.storyConfiguration().customId = configuration.custom_id
    this.activeStory.storyConfiguration().tracking = configuration.tracking
    this.activeStory.storyConfiguration().sharing = configuration.sharing
    this.activeStory.storyConfiguration().tapLink = configuration.tapLink
    this.activeStory.storyConfiguration().footer = configuration.footer
    this.activeStory.storyConfiguration().cumulativeMode =
      configuration.cumulativeMode
  }
}
