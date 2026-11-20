import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, OnInit, OnDestroy, HostListener, effect, inject, signal, untracked } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../board/board.component'
import { BoardHeaderComponent } from './components/board-header/board-header.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { StoryPanelComponent } from 'src/app/features/dashboard/components/story-panel/story-panel.component'
import { BoardActionsComponent } from './components/board-actions/board-actions.component'
import { BoardControlsComponent, BoardViewRequest } from './components/board-controls/board-controls.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { findNodeInTree } from 'src/app/shared/utils/tree-searching'
import { StatisticsService } from 'src/app/shared/services/statistics.service'
import { BoardPreferencesService } from '../board/services/board-preferences.service'
import { StoryEditorLoader } from '../board/components/rich-text/story-editor-loader.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { LinearEditorComponent } from '../linear-editor/linear-editor.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ModalService } from 'src/app/core/services/modal.service'
import { KEEP_OVERLAYS } from 'src/app/core/services/overlay.service'
import { ShareStoryComponent } from './modals/share-story/share-story.component'
import { StoryOptionsModalComponent } from './modals/story-options/story-options-modal.component'
import { buildExampleStory, EXAMPLE_STORY_COPY } from 'src/app/shared/example-story/exampleStory'
import { isMobileLayout } from 'src/app/core/constants'
import { BoardInsets } from '../board/services/panzoom.service'

const PANEL_PREFERENCE = 'polo-board-panel'
/** The project panel's width plus the gaps around it, for what is centred on the rest of the board. */
const PANEL_INSET = 332

/** Open as the author last left it; at first, only where the board has room for it beside the story. */
function initialPanelState(): boolean {
  try {
    const saved = localStorage.getItem(PANEL_PREFERENCE)
    if (saved) return saved === 'open'
  } catch {
    // Without storage the panel follows the screen size.
  }
  return typeof window !== 'undefined' && window.innerWidth >= 1280 && !isMobileLayout()
}

@Component({
  selector: 'polo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BoardComponent,
    BoardHeaderComponent,
    StoryPanelComponent,
    BoardActionsComponent,
    BoardControlsComponent,
    LinearEditorComponent,
    TranslatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('board') board?: BoardComponent
  @ViewChild('header', { read: ElementRef }) headerElement?: ElementRef<HTMLElement>
  @ViewChild('header') header?: BoardHeaderComponent
  @ViewChild('linear') linear?: LinearEditorComponent
  @ViewChild('controls') controls?: BoardControlsComponent
  readonly sidebarOpen = signal(initialPanelState())
  /** The address names a story that does not exist (any more) or is not the author's. */
  readonly missing = signal(false)
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
  }

  async openShare() {
    this.commitEdits()
    // Sharing needs a stored story, so an untouched example is saved first.
    if (!(await this.mutations.ensureSaved())) return
    this.modal.launch(ShareStoryComponent)
  }

  openStoryOptions() {
    this.commitEdits()
    this.modal.launch(StoryOptionsModalComponent)
  }

  setSidebar(open: boolean) {
    this.sidebarOpen.set(open)
    try {
      localStorage.setItem(PANEL_PREFERENCE, open ? 'open' : 'closed')
    } catch {
      // The panel still opens and closes; it is only not remembered.
    }
  }

  changeView(request: BoardViewRequest) {
    const board = this.board
    if (!board) return
    if (request === 'zoomIn') board.zoomBy(1.25)
    else if (request === 'zoomOut') board.zoomBy(0.8)
    else if (request === 'zoomReset') board.zoomTo(1)
    else if (request === 'fit') board.fitToView(this.boardInsets())
    else board.centerToEntryPoint()
  }

  /** The part of the board the panels over it leave free. */
  private boardInsets(): BoardInsets {
    const panel = this.sidebarOpen() && !isMobileLayout()
    return { top: 88, right: 32, bottom: 88, left: panel ? PANEL_INSET + 16 : 32 }
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

  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)

  constructor(
    private db: DatabaseService,
    public activeStory: ActiveStoryService,
    private stadistics: StatisticsService,
    private boardPreferences: BoardPreferencesService,
    private editorLoader: StoryEditorLoader,
    private mutations: StoryMutationService,
    private i18n: I18nService,
    private modal: ModalService,
    private host: ElementRef<HTMLElement>
  ) {
    this.mutations.beginHistorySession()
    // The example becomes one of the author's stories once they change it.
    effect(() => {
      const created = this.mutations.savedDraft()
      if (!created) return
      untracked(() => {
        if (this.activeStory.storyId() === created.id) {
          localStorage.setItem('polo-id', created.id)
          this.showInAddress(created.id)
        }
        const stories = this.header?.stories()
        if (stories && !stories.some((story) => story.id === created.id)) {
          this.header?.stories.set([{ id: created.id, name: created.name }, ...stories])
        }
      })
    })
  }

  @HostListener('document:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent) {
    if (event.defaultPrevented || event.repeat || event.altKey || this.missing()) return
    const target = event.target
    if (target instanceof Element) {
      if (target !== document.body && !this.host.nativeElement.contains(target)) return
      if (target.closest('input, textarea, select, [contenteditable], [role="textbox"], dialog, [role="dialog"]')) return
    }
    if (document.querySelector('dialog[open]')) return
    const modifier = event.ctrlKey || event.metaKey
    // `?` lists the shortcuts, wherever the keyboard puts it.
    if (event.key === '?' && !modifier) {
      this.controls?.toggleShortcuts()
      event.preventDefault()
      return
    }
    if (!modifier) return
    const key = event.key.toLowerCase()
    if (key === '.' && !event.shiftKey) {
      this.setSidebar(!this.sidebarOpen())
      event.preventDefault()
      return
    }
    const direction = key === 'z' ? (event.shiftKey ? 'redo' : 'undo')
      : key === 'y' && !event.shiftKey ? 'redo' : undefined
    if (!direction) return
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
    // /story/:storyId/board opens that story; /board, the last one edited.
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const storyId = params.get('storyId')
      this.initBoard(storyId ?? localStorage.getItem('polo-id'), { remembered: !storyId })
    })
  }

  /**
   * Keep the open story in the address, so it can be bookmarked, shared with another tab and
   * reached again with the back button. The board route is reused, so this does not reload it.
   */
  private showInAddress(storyId: string) {
    // Only when the router shows the board, not when it is rendered on its own.
    if (!this.route.routeConfig || this.route.snapshot.paramMap.get('storyId') === storyId) return
    // Only the address changes, so a dialog the author already opened stays open.
    this.router.navigate(['/story', storyId, 'board'], { replaceUrl: true, state: { [KEEP_OVERLAYS]: true } })
  }

  ngAfterViewInit() {
    // The group toolbar sits under the header, the only panel at the top of the board.
    const menu = this.headerElement?.nativeElement.querySelector('.header')
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

  /**
   * `remembered` is the story the editor opened last, not one the address names: if it is gone,
   * another one opens. A story the address names and that is gone says so instead.
   */
  async initBoard(storyId: string | null, { remembered = false } = {}) {
    const request = ++this.loadRequest
    const currentId = this.activeStory.storyId()
    // Also when the address only catches up with the open story, maybe while the author types.
    if (storyId && storyId === currentId && storyId === this.loadedStoryId) {
      this.missing.set(false)
      return
    }
    this.commitEdits()
    const currentTree = this.activeStory.entireTree()
    const hadPendingChanges = this.mutations.hasUnsavedChanges()
    const named = storyId ? await this.db.getStoryWithID(storyId) : false
    if (request !== this.loadRequest) return
    if (!named && storyId && !remembered) {
      this.missing.set(true)
      return
    }
    const story = named || await this.db.getNewestStory()
    if (request !== this.loadRequest) return
    if (!story) {
      // Authors without stories start from an example that is only stored once they change it.
      if (this.db.user()) this.loadExampleDraft()
      return
    }

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
    this.missing.set(false)
    localStorage.setItem('polo-id', story.id)
    // A forgotten last story falls back to another one, which the address must name.
    this.showInAddress(story.id)

    this.mutations.loadStory(story.id, story.name, story.tree)
    this.loadedStoryId = story.id

    this.stadistics.clean()
    this.setInitialBoardPositionFor(story.id)

    setTimeout(() => this.board?.refreshFlows(), 0)

    this.loadConfigurationForStory(story.id)
  }

  private loadExampleDraft() {
    const copy = this.i18n.pick(EXAMPLE_STORY_COPY)
    const storyId = self.crypto.randomUUID()
    this.mutations.loadDraft(storyId, copy.title, buildExampleStory(copy))
    this.missing.set(false)
    this.loadedStoryId = storyId
    this.stadistics.clean()
    this.setInitialBoardPositionFor(storyId)
    setTimeout(() => this.board?.refreshFlows(), 0)
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
    const story = await this.db.createEmptyStory(this.i18n.t('dashboard.newStoryName'))
    if (!story) {
      console.error("Can't create new tree")
      return
    }

    this.header?.stories.update((stories) => [story, ...stories])
    await this.router.navigate(['/story', story.id, 'board'])
  }
}
