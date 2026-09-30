import { Component, ViewChild, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../board/board.component'
import { MenuComponent } from './components/menu/menu.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { MenuTopComponent } from 'src/app/features/dashboard/components/menu-top/menu-top.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { MenuTreeLegendComponent } from './components/menu-tree-legend/menu-tree-legend.component'
import { findNodeInTree } from 'src/app/shared/utils/tree-searching'
import { StatisticsService } from 'src/app/shared/services/statistics.service'
import { BoardPreferencesService } from '../board/services/board-preferences.service'
import { StoryEditorLoader } from '../board/components/rich-text/story-editor-loader.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'

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
export class DashboardComponent implements OnInit {
  @ViewChild('board') board?: BoardComponent
  @ViewChild('menuTop') menuTop?: MenuTopComponent
  @ViewChild('menuSide') menuSide?: MenuComponent

  id?: string
  private loadRequest = 0

  constructor(
    private db: DatabaseService,
    public activeStory: ActiveStoryService,
    private stadistics: StatisticsService,
    private boardPreferences: BoardPreferencesService,
    private editorLoader: StoryEditorLoader,
    private mutations: StoryMutationService
  ) {}

  ngOnInit(): void {
    // Authors are here to edit, so have the editor ready before the first click.
    this.editorLoader.prefetchWhenIdle()
    // If there is some tree reference in localstorage, load that one
    const localStoryId = localStorage.getItem('polo-id')
    this.initBoard(localStoryId)
  }

  async initBoard(storyId: string | null) {
    const request = ++this.loadRequest
    const currentId = this.activeStory.storyId()
    const currentTree = this.activeStory.entireTree()
    const hadPendingChanges = this.mutations.hasUnsavedChanges()
    const story = storyId
      ? await this.db.getStoryWithID(storyId)
      : await this.db.getNewestStory()
    if (!story || request !== this.loadRequest) return

    // A read started before a deletion/save must not resurrect its old tree,
    // even if the save finished while that read was still in flight.
    const keepCurrentTree =
      story.id === currentId && this.activeStory.storyId() === currentId &&
      (hadPendingChanges || this.activeStory.entireTree() !== currentTree)
    this.loadStory(keepCurrentTree
      ? { ...story, tree: this.activeStory.entireTree() }
      : story)
  }

  loadStory(story: any) {
    localStorage.setItem('polo-id', story.id)

    this.mutations.loadStory(story.id, story.name, story.tree)

    this.stadistics.clean()
    this.setInitialBoardPositionFor(story.id)

    setTimeout(() => this.board?.refreshFlows(), 0)

    this.loadConfigurationForStory(story.id)
  }

  setInitialBoardPositionFor(storyId: string) {
    console.log('Setting initial board position for story:', storyId)

    const activeNodeId = this.boardPreferences.getActiveNode(storyId)
    if (activeNodeId) {
      const activeNode = findNodeInTree(
        activeNodeId,
        this.activeStory.entireTree()
      )
      this.board?.centerToNode(activeNode)
    } else {
      console.log('No active node found, centering to first node')
      setTimeout(() => {
        this.board?.centerToNode(this.activeStory.entireTree().nodes[0])
      }, 0)
    }
  }

  async loadConfigurationForStory(storyId: string) {
    const configuration: any = await this.db.getConfigurationOf(storyId)

    if (!configuration || this.activeStory.storyId() !== storyId) return

    this.activeStory.patchConfiguration({
      customId: configuration.custom_id,
      tracking: configuration.tracking,
      sharing: configuration.sharing,
      tapLink: configuration.tapLink,
      footer: configuration.footer,
      cumulativeMode: configuration.cumulativeMode,
    })
  }

  async createNewStory() {
    const newTreeData = [
      {
        name: 'My new tree',
        tree: {
          nodes: [],
          refs: {},
        },
        profile_id: this.db.user()?.id,
      },
    ]
    const newTree = await this.db.createNewTree(newTreeData)
    if (!newTree) {
      console.error("Can't create new tree")
      return
    }

    this.menuSide?.stories().push({
      id: newTree[0].id,
      name: newTree[0].name,
    })

    this.initBoard(newTree[0].id)
    this.board?.goTo(-5000, -5000)
  }

  async deleteStory(storyId: string) {
    try {
      // remove the story from database
      await this.db.deleteStory(storyId)
      // remove the story from stories
      this.menuSide?.stories.set(
        this.menuSide?.stories().filter((story: any) => story.id !== storyId)
      )
      // clean board
      this.activeStory.reset()
    } catch (err) {
      console.error(err)
    }
  }
}
