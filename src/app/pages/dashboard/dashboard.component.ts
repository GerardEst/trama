import { Component, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../../components/board/board.component'
import { MenuComponent } from '../../components/menu/menu.component'
import { DatabaseService } from '../../services/database.service'
import { MenuTopComponent } from 'src/app/components/menu-top/menu-top.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { MenuTreeLegendComponent } from 'src/app/components/menu-tree-legend/menu-tree-legend.component'
import { configuration } from 'src/app/services/database-interfaces'
import { findNodeInTree } from 'src/app/utils/tree-searching'

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
    public activeStory: ActiveStoryService
  ) {}

  ngOnInit(): void {
    // If there is some tree reference in localstorage, load that one
    const localStoryId = localStorage.getItem('polo-id')
    this.initBoard(localStoryId)

    // Remove indicator that user is coming from oauth login
    localStorage.removeItem('oauth')
  }

  async initBoard(storyId: string | null) {
    if (storyId) {
      const story = await this.db.getStory(storyId)
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

    this.activeStory.initTreeRefs(story.tree)
    this.setInitialBoardPositionFor(story.id)

    // TODO -> Comença mal pintat
    // Quan es detecta automaticament fa una cosa rara, pero si m'espero a que tot estigui pintat, bé.
    // També, si arrastrem abans que s'acabi de pintar l'arbre sencer o acabi de fer el que hagi de fer, el drag no repinta les linies
    // Amb aquest timeout es veu el salt
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
    const configuration: configuration =
      await this.db.getConfigurationOf(storyId)

    this.activeStory.storyConfiguration().tracking = configuration.tracking
    this.activeStory.storyConfiguration().sharing = configuration.sharing
    this.activeStory.storyConfiguration().askName = configuration.askName
    this.activeStory.storyConfiguration().cumulativeView =
      configuration.cumulativeView
  }
}
