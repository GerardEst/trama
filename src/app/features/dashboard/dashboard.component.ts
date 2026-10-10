import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener, signal } from '@angular/core'
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
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { LinearEditorComponent } from '../linear-editor/linear-editor.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BoardComponent,
    MenuComponent,
    MenuTopComponent,
    MenuTreeLegendComponent,
    LinearEditorComponent,
    TranslatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('board') board?: BoardComponent
  @ViewChild('menuTop') menuTop?: MenuTopComponent
  @ViewChild('menuTop', { read: ElementRef }) menuTopElement?: ElementRef<HTMLElement>
  @ViewChild('menuSide') menuSide?: MenuComponent
  @ViewChild('linear') linear?: LinearEditorComponent
  readonly linearOpen = signal(false)
  readonly mobileBoard = signal(false)
  readonly boardWidth = signal(70)
  readonly resizing = signal(false)
  readonly toolbarTop = signal(88)
  private headerResize?: ResizeObserver
  readonly playingNodeId = signal<string | undefined>(undefined)
  private resizePointer?: number

  openLinearView() {
    this.linearOpen.set(true)
    this.mobileBoard.set(false)
    // The pinned story list must not cover the full-width mobile reading pane.
    if (window.matchMedia('(max-width: 760px)').matches && this.menuSide) this.menuSide.fixedMenu = false
  }

  closeLinearView() {
    this.linearOpen.set(false)
    this.mobileBoard.set(false)
    this.highlightPlayingNode(undefined)
  }

  highlightPlayingNode(nodeId: string | undefined) {
    this.playingNodeId.set(nodeId)
    if (nodeId === undefined) this.board?.cancelNodeReveal()
  }

  revealPlayingNode(nodeId: string) {
    this.board?.revealNode(nodeId)
  }

  startResize(event: PointerEvent) {
    if (event.button !== 0) return
    event.preventDefault()
    this.resizePointer = event.pointerId
    this.resizing.set(true)
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
  }

  // The divider captures the pointer, so its own events cover the whole resize
  // without a document listener running change detection on every move.
  resizeWorkspace(event: PointerEvent) {
    if (event.pointerId !== this.resizePointer) return
    this.setBoardWidth(event.clientX / window.innerWidth * 100)
  }

  stopResize(event: PointerEvent) {
    if (event.pointerId !== this.resizePointer) return
    this.resizePointer = undefined
    this.resizing.set(false)
    if (this.linear?.followNode()) this.linear.locateNode()
  }

  resizeWithKeyboard(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return
    event.preventDefault()
    this.setBoardWidth(event.key === 'Home' ? 70 : this.boardWidth() + (event.key === 'ArrowLeft' ? -5 : 5))
    if (this.linear?.followNode()) this.linear.locateNode()
  }

  private setBoardWidth(width: number) {
    this.boardWidth.set(Math.max(35, Math.min(75, width)))
    this.board?.refreshFlows()
  }

  id?: string
  private loadRequest = 0
  private loadedStoryId?: string

  constructor(
    private db: DatabaseService,
    public activeStory: ActiveStoryService,
    private stadistics: StatisticsService,
    private boardPreferences: BoardPreferencesService,
    private editorLoader: StoryEditorLoader,
    private mutations: StoryMutationService,
    private i18n: I18nService,
    private host: ElementRef<HTMLElement>
  ) {
    this.mutations.beginHistorySession()
  }

  @HostListener('document:keydown', ['$event'])
  handleHistoryShortcut(event: KeyboardEvent) {
    if (event.defaultPrevented || event.repeat || event.altKey ||
      !(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    const direction = key === 'z' ? (event.shiftKey ? 'redo' : 'undo')
      : key === 'y' && !event.shiftKey ? 'redo' : undefined
    if (!direction) return
    const target = event.target
    if (target instanceof Element) {
      if (target !== document.body && !this.host.nativeElement.contains(target)) return
      if (target.closest('input, textarea, select, [contenteditable], [role="textbox"], dialog, [role="dialog"]')) return
    }
    if (document.querySelector('dialog[open]')) return
    if (this.restoreHistory(direction)) event.preventDefault()
  }

  restoreHistory(direction: 'undo' | 'redo'): boolean {
    if (this.resizing() || this.board?.isInteracting) return false
    this.commitEdits()
    const changed = direction === 'undo' ? this.mutations.undo() : this.mutations.redo()
    if (changed) this.board?.historyRestored()
    return changed
  }

  ngOnInit(): void {
    // Authors are here to edit, so have the editor ready before the first click.
    this.editorLoader.prefetchWhenIdle()
    // If there is some tree reference in localstorage, load that one
    const localStoryId = localStorage.getItem('polo-id')
    this.initBoard(localStoryId)
  }

  ngAfterViewInit() {
    const menu = this.menuTopElement?.nativeElement.querySelector('.menu')
    if (menu && typeof ResizeObserver !== 'undefined') {
      this.headerResize = new ResizeObserver(() => this.toolbarTop.set(Math.max(88, menu.getBoundingClientRect().bottom + 8)))
      this.headerResize.observe(menu)
    }
  }

  /** Called by CanDeactivate while the fields and their output subscriptions are alive. */
  commitEdits() {
    this.board?.commitEdits()
    this.linear?.commitEdits()
    this.activeStory.endHistoryCoalescing()
  }

  ngOnDestroy() {
    this.loadRequest++
    this.mutations.endHistorySession()
    this.headerResize?.disconnect()
  }

  async initBoard(storyId: string | null) {
    this.commitEdits()
    const request = ++this.loadRequest
    const currentId = this.activeStory.storyId()
    if (storyId && storyId === currentId && storyId === this.loadedStoryId) return
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
    this.loadedStoryId = story.id

    this.stadistics.clean()
    this.setInitialBoardPositionFor(story.id)

    setTimeout(() => this.board?.refreshFlows(), 0)

    this.loadConfigurationForStory(story.id)
  }

  setInitialBoardPositionFor(storyId: string) {
    const activeNodeId = this.boardPreferences.getActiveNode(storyId)
    const activeNode = activeNodeId
      ? findNodeInTree(activeNodeId, this.activeStory.entireTree())
      : undefined
    if (activeNode) {
      this.board?.centerToNode(activeNode)
    } else {
      setTimeout(() => {
        if (this.activeStory.storyId() !== storyId) return
        const initial = this.activeStory.initialNode()
        if (initial) this.board?.centerToNode(initial)
        else this.board?.centerToEntryPoint()
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
        name: this.i18n.t('dashboard.newStoryName'),
        tree: {
          nodes: [],
          refs: {},
          entryPoint: { left: 5000, top: 5000 },
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

    await this.initBoard(newTree[0].id)
    this.board?.centerToEntryPoint()
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
