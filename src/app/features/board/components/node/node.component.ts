import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { CdkDragHandle } from '@angular/cdk/drag-drop'
import { AnswerComponent } from './answer/answer.component'
import { ConditionComponent } from '../condition/condition.component'
import { FormsModule } from '@angular/forms'
import { PanzoomService } from 'src/app/features/board/services/panzoom.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ImageComponent } from 'src/app/shared/components/ui/image/image.component'
import { FormFieldComponent } from 'src/app/shared/components/ui/form-field/form-field.component'
import {
  link,
  shareOptions,
  node_answer,
  node_conditions,
  node_fallbackCondition,
  node_userTextOptions,
  event,
  join,
} from 'src/app/core/interfaces/interfaces'
import {
  generateIDForNewAnswer,
  generateIDForNewCondition,
} from 'src/app/shared/utils/tree-searching'
import { NodeOptionsComponent } from './context-menus/node-options/node-options.component'
import { NodeEventsComponent } from './node-events/node-events.component'
import { BoardAnchorDirective } from '../../directives/board-anchor.directive'
import { StoryEditorService } from '../../services/story-editor.service'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
import { RichTextFieldComponent } from '../rich-text/rich-text-field.component'
import { EditableNameComponent } from 'src/app/shared/components/ui/editable-name/editable-name.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { SortableListDirective, SortableMove } from 'src/app/shared/directives/sortable-list.directive'
import { ContextHelpComponent } from 'src/app/shared/context-help/context-help.component'
import { NODE_CONTEXT_HELP_TOPICS } from 'src/app/shared/context-help/context-help.topics'

@Component({
  selector: 'polo-node',
  standalone: true,
  imports: [
    CommonModule,
    AnswerComponent,
    ConditionComponent,
    FormsModule,
    BasicButtonComponent,
    ImageComponent,
    FormFieldComponent,
    NodeOptionsComponent,
    NodeEventsComponent,
    RichTextFieldComponent,
    EditableNameComponent,
    BoardAnchorDirective,
    CdkDragHandle,
    TranslatePipe,
    SortableListDirective,
    ContextHelpComponent,
  ],
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/**
 * Receives inputs for the content from activeStory
 * and updates activeStory object, so input changes
 * are detected and node is updated
 */
export class NodeComponent {
  readonly nodeHelpTopics = NODE_CONTEXT_HELP_TOPICS

  @Input() nodeId: string = ''
  @Input() name?: string
  @Input() frameName?: string

  // Common
  @Input() text: string = ''
  @Input() image?: string
  @Input() join: join[] = []
  @Input() events?: Array<event>
  // Answer nodes
  @Input() answers?: Array<node_answer>
  // Distributor nodes
  @Input() conditions?: Array<node_conditions>
  @Input() fallbackCondition?: node_fallbackCondition
  // End nodes
  private nodeLinks: link[] = []
  private nodeShareOptions: shareOptions = {}

  @Input()
  set links(links: link[]) {
    this.nodeLinks = structuredClone(links ?? [])
  }
  get links() {
    return this.nodeLinks
  }

  @Input()
  set shareOptions(options: shareOptions) {
    this.nodeShareOptions = structuredClone(options ?? {})
  }
  get shareOptions() {
    return this.nodeShareOptions
  }
  // Text nodes
  @Input() userTextOptions?: node_userTextOptions

  openedShareOptions: boolean = false
  private imageUploadSequence = 0
  readonly loading = signal(false)
  readonly loadingMessage = signal<string | undefined>(undefined)
  optionsOpen: boolean = false
  readonly answerOrderAnnouncement = signal('')
  readonly routeOrderAnnouncement = signal('')

  @Input() type: 'text' | 'content' | 'distributor' | 'end' = 'content'
  @Output() duplicateNode = new EventEmitter<string>()
  @Output() removeFromFrame = new EventEmitter<string>()
  @Output() removeNode = new EventEmitter<{
    nodeId: string
    answers?: string[]
  }>()

  @ViewChild(RichTextFieldComponent) richTextField?: RichTextFieldComponent
  @ViewChildren(AnswerComponent) answerComponents?: QueryList<AnswerComponent>
  @ViewChild('shortcutImageInput') shortcutImageInput?: ElementRef<HTMLInputElement>

  constructor(
    private panzoom: PanzoomService,
    public database: DatabaseService,
    public activeStory: ActiveStoryService,
    private storyEditor: StoryEditorService,
    private anchorRegistry: BoardAnchorRegistryService,
    private i18n: I18nService
  ) {}

  typeName() {
    return this.i18n.t(`board.node.types.${this.type}`)
  }

  kindName() {
    return this.i18n.t(`board.node.kinds.${this.type}`)
  }

  openImagePicker(): boolean {
    const input = this.shortcutImageInput?.nativeElement
    if (!input || this.type === 'distributor') return false
    input.click()
    return true
  }

  async onAddImage(event: Event) {
    const imageInput = event.target as HTMLInputElement
    const imageFile = imageInput.files?.[0]
    if (!imageFile) return

    const request = ++this.imageUploadSequence
    this.loading.set(true)
    this.loadingMessage.set(this.i18n.t('board.node.optimizingImage'))

    try {
      const result = await this.storyEditor.uploadImageToNode(this.nodeId, imageFile)
      if (request !== this.imageUploadSequence) return
      this.loadingMessage.set(result.status === 'optimization-failed'
        ? this.i18n.t('board.node.imageTooBig')
        : result.status === 'upload-failed' ? this.i18n.t('board.node.imageError') : undefined)
    } catch (error: unknown) {
      console.error('Could not add a node image', error)
      if (request === this.imageUploadSequence) this.loadingMessage.set(this.i18n.t('board.node.imageError'))
    } finally {
      if (request === this.imageUploadSequence) {
        this.loading.set(false)
        imageInput.value = ''
      }
    }
  }

  removeNodeImage() {
    this.storyEditor.removeImageFromNode(this.nodeId)
  }

  updateShareOptions() {
    this.storyEditor.updateNodeShareOptions(this.nodeId, this.shareOptions)
  }

  addAnswer() {
    const newId = generateIDForNewAnswer(this.nodeId, this.answers)
    this.storyEditor.createNodeAnswer(this.nodeId, newId)
    if (this.panzoom.focusElements) {
      setTimeout(() => this.answerComponents?.find(answer => answer.answerId === newId)?.focusText(), 0)
    }
  }

  addCondition() {
    const newId = generateIDForNewCondition(this.nodeId, this.conditions)
    this.storyEditor.createNodeCondition(this.nodeId, newId)
  }

  // Need to do this way because empty links are not saved
  addExternalLink() {
    this.links = [...this.links, { name: '', url: '' }]
  }

  updateLinks() {
    this.storyEditor.updateNodeLinks(this.nodeId, this.links)
  }

  reorderAnswer(move: SortableMove) {
    if (this.storyEditor.reorderAnswer(this.nodeId, move.id, move.toIndex)) {
      this.anchorRegistry.invalidate()
      this.answerOrderAnnouncement.set(this.i18n.t('board.answer.moved', {
        position: move.toIndex + 1,
        count: this.answers?.length ?? 0,
      }))
    }
  }

  reorderCondition(move: SortableMove) {
    if (this.storyEditor.reorderCondition(this.nodeId, move.id, move.toIndex)) {
      this.anchorRegistry.invalidate()
      this.routeOrderAnnouncement.set(this.i18n.t('board.route.moved', {
        position: move.toIndex + 1,
        count: this.conditions?.length ?? 0,
      }))
    }
  }

  listSorting(active: boolean) {
    if (active) this.panzoom.pauseDrag()
    else this.panzoom.resumeDrag()
  }

  removeAnswer(id: string) {
    this.storyEditor.removeAnswer(this.nodeId, id)
    // TODO - Redibujar joins
  }

  removeCondition(id: string) {
    this.storyEditor.removeCondition(this.nodeId, id)
  }

  moveCondition(id: string, direction: -1 | 1) {
    this.storyEditor.moveCondition(this.nodeId, id, direction)
  }

  commitEdits() {
    this.richTextField?.commit()
    this.answerComponents?.forEach(answer => answer.richTextField?.commit())
  }

  saveNodeName(name: string) {
    this.storyEditor.updateNodeName(this.nodeId, name)
  }

  saveRichText(html: string) {
    this.storyEditor.updateNodeText(this.nodeId, html)
  }

  saveProperty(event: Event) {
    const newProperty = this.getControlValue(event)
    this.storyEditor.updateNodeProperty(this.nodeId, newProperty)
  }

  savePlaceholder(event: Event) {
    const newPlaceholder = this.getControlValue(event)
    this.storyEditor.updateNodePlaceholder(this.nodeId, newPlaceholder)
  }

  saveDescription(event: Event) {
    const newDescription = this.getControlValue(event)
    this.storyEditor.updateNodeDescription(this.nodeId, newDescription)
  }

  saveButtonText(event: Event) {
    const newButtonText = this.getControlValue(event)
    this.storyEditor.updateNodeButtonText(this.nodeId, newButtonText)
  }

  onDuplicateNode() {
    this.duplicateNode.emit(this.nodeId)
  }

  onRemoveFromFrame() {
    this.optionsOpen = false
    this.removeFromFrame.emit(this.nodeId)
  }

  onRemoveNode() {
    if (this.nodeId === 'node_0') {
      alert(this.i18n.t('board.node.cannotDeleteStart'))
      return
    }
    const data = {
      nodeId: this.nodeId,
      answers: this.answers?.map((answer) => answer.id),
    }
    this.removeNode.emit(data)

    this.panzoom.resumeDrag()
  }

  private getControlValue(event: Event) {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value
  }
}
