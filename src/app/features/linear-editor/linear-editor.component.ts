import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren, computed, effect, output, signal, untracked } from '@angular/core'
import { node_answer } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryEditorService } from '../board/services/story-editor.service'
import { RichTextEditorComponent } from '../board/components/rich-text/rich-text-editor.component'
import { RichTextToolbarComponent } from '../board/components/rich-text/rich-text-toolbar.component'
import { GameNodeComponent } from '../playground/components/game/components/game-node/game-node.component'
import { GameEngineService } from '../playground/services/game-engine.service'
import { GameSessionService } from '../playground/services/game-session.service'
import { PlayerService } from '../playground/services/player.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { storyPlainText } from 'src/app/shared/utils/story-html'

/** Preview by default; editing turns the same node into a sheet with one shared toolbar. */
@Component({
  selector: 'polo-linear-editor',
  standalone: true,
  imports: [GameNodeComponent, RichTextEditorComponent, RichTextToolbarComponent, TranslatePipe],
  providers: [PlayerService, GameEngineService, GameSessionService],
  templateUrl: './linear-editor.component.html',
  styleUrl: './linear-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinearEditorComponent implements OnDestroy {
  @ViewChild('content') content?: ElementRef<HTMLElement>
  // A template reference keeps the rich-text component eligible for deferred loading.
  @ViewChildren('textEditor') textEditors?: QueryList<RichTextEditorComponent>
  readonly closed = output<void>()
  readonly nodeRequested = output<string>()
  readonly highlightedNodeChanged = output<string | undefined>()
  readonly boardRequested = output<void>()
  readonly followNode = signal(true)
  private readonly editingStoryId = signal<string | undefined>(undefined)
  private readonly selectedEditor = signal<{ storyId: string; visitId: number; editor: RichTextEditorComponent } | undefined>(undefined)
  readonly editing = computed(() => this.editingStoryId() !== undefined && this.editingStoryId() === this.story.storyId())
  readonly toolbarEditor = computed(() => {
    const selected = this.selectedEditor()
    return this.editing() && selected?.storyId === this.story.storyId() && selected.visitId === this.session.currentVisit()?.id
      ? selected.editor : undefined
  })
  private scrollFrame?: number

  readonly sourceNode = computed(() => this.story.entireTree().nodes.find(node => node.id === this.session.currentNodeId() && node.type !== 'group'))
  readonly currentNodes = computed(() => {
    const source = this.sourceNode()
    const visit = this.session.currentVisit()
    if (!source || !visit) return []
    const rendered = this.engine.renderNode(source, visit.entry, visit.player)
    return [{ ...rendered, key: visit.id, source, storyId: this.story.storyId(),
      authoredAnswers: (source.answers ?? []).map((answer, index) => {
        const playable = rendered.answers?.find(candidate => candidate.id === answer.id)
        return { source: answer, index, text: playable?.text ?? answer.text ?? '', disabled: !playable?.join?.length }
      }) }]
  })
  readonly history = computed(() => this.session.visits().slice(0, this.session.cursor() + 1).map((visit, index) => {
    const source = this.story.entireTree().nodes.find(node => node.id === visit.nodeId && node.type !== 'group')
    return { index, id: visit.id, nodeId: visit.nodeId, exists: !!source,
      label: source?.name || storyPlainText(source?.text).trim().slice(0, 65) || visit.nodeId }
  }))

  constructor(
    public story: ActiveStoryService,
    public session: GameSessionService,
    private engine: GameEngineService,
    private editor: StoryEditorService
  ) {
    effect(() => {
      const visit = this.session.currentVisit()
      const following = this.followNode()
      if (this.editing()) untracked(() => this.session.pause())
      untracked(() => {
        this.highlightedNodeChanged.emit(following ? visit?.nodeId : undefined)
        if (visit && following) this.nodeRequested.emit(visit.nodeId)
      })
    }, { allowSignalWrites: true })
    effect(() => {
      this.session.currentVisit()
      if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame)
      this.scrollFrame = requestAnimationFrame(() => this.content?.nativeElement.scrollTo({ top: 0 }))
    })
  }

  ngOnDestroy() {
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame)
  }

  toggleEditing() {
    this.commitEdits()
    this.editingStoryId.set(this.editing() ? undefined : this.story.storyId())
    this.selectedEditor.set(undefined)
    if (this.editing()) this.session.pause()
  }

  activateEditor(editor: RichTextEditorComponent) {
    const visit = this.session.currentVisit()
    if (this.editing() && visit) this.selectedEditor.set({ storyId: this.story.storyId(), visitId: visit.id, editor })
  }

  savePassage(storyId: string, nodeId: string, text: string) {
    if (this.canSave(storyId, nodeId)) this.editor.updateNodeText(nodeId, text)
  }

  saveAnswer(storyId: string, nodeId: string, answerId: string, text: string) {
    if (this.canSave(storyId, nodeId)) this.editor.updateAnswerText(answerId, text)
  }

  selectAnswer(answer: node_answer) {
    if (this.editing()) return
    this.commitEdits()
    const current = this.currentNodes()[0]?.authoredAnswers.find(candidate => candidate.source.id === answer.id)
    if (current && !current.disabled) this.session.selectAnswer(current.source)
  }

  continueFlow(value: string) {
    if (this.editing()) return
    this.commitEdits()
    const node = this.sourceNode()
    if (node) this.session.continueFlow({ value, property: node.userTextOptions?.property ?? '', join: node.join })
  }

  continueAutomatic() {
    this.commitEdits()
    this.session.nextStep(this.sourceNode()?.join ?? [], true)
  }

  back() {
    this.commitEdits()
    this.session.back()
  }

  restart() {
    this.commitEdits()
    this.selectedEditor.set(undefined)
    this.session.restart()
  }

  goToVisit(index: number) {
    this.commitEdits()
    this.session.goToVisit(index)
  }

  locateNode() {
    const id = this.session.currentNodeId()
    if (id) this.nodeRequested.emit(id)
  }

  showBoard() {
    this.commitEdits()
    this.boardRequested.emit()
    this.locateNode()
  }

  close() {
    this.commitEdits()
    this.closed.emit()
  }

  commitEdits() {
    this.textEditors?.forEach(editor => editor.commit())
  }

  private canSave(storyId: string, nodeId: string) {
    return storyId === this.story.storyId() && this.story.entireTree().nodes.some(node => node.id === nodeId)
  }
}
