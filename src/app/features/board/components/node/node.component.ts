import {
  Component,
  Input,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { AnswerComponent } from './answer/answer.component'
import { ConditionComponent } from '../condition/condition.component'
import { FormsModule } from '@angular/forms'
import { PanzoomService } from 'src/app/features/board/services/panzoom.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ImageComponent } from 'src/app/shared/components/ui/image/image.component'
import {
  link,
  shareOptions,
  node_answer,
  node_conditions,
  node_userTextOptions,
  event,
} from 'src/app/core/interfaces/interfaces'
import {
  generateIDForNewAnswer,
  generateIDForNewCondition,
} from 'src/app/shared/utils/tree-searching'
import { ApisService } from 'src/app/core/services/apis.service'
import { StorageService } from 'src/app/shared/services/storage.service'
import { NodeOptionsComponent } from './context-menus/node-options/node-options.component'
import { NodeEventsComponent } from './node-events/node-events.component'

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
    NodeOptionsComponent,
    NodeEventsComponent,
  ],
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.sass'],
})

/**
 * Receives inputs for the content from activeStory
 * and updates activeStory object, so input changes
 * are detected and node is updated
 */
export class NodeComponent {
  @Input() nodeId: string = ''

  // Common
  @Input() text: string = ''
  @Input() image?: string
  @Input() join: string = ''
  @Input() events?: Array<event>
  // Answer nodes
  @Input() answers?: Array<node_answer>
  // Distributor nodes
  @Input() conditions?: Array<node_conditions>
  // End nodes
  @Input() links: link[] = []
  @Input() shareOptions: shareOptions = {
    sharedText: '',
    shareButtonText: '',
  }
  // Text nodes
  @Input() userTextOptions?: node_userTextOptions

  openedShareOptions: boolean = false
  loading: boolean = false
  loadingMessage?: string
  optionsOpen: boolean = false

  @Input() type: 'content' | 'distributor' | 'end' = 'content'
  @Output() duplicateNode: EventEmitter<any> = new EventEmitter()
  @Output() removeNode: EventEmitter<any> = new EventEmitter()

  @ViewChild('textarea') textarea?: ElementRef
  @ViewChild('imageInput') imageInput?: ElementRef

  constructor(
    public elementRef: ElementRef,
    private panzoom: PanzoomService,
    public database: DatabaseService,
    public activeStory: ActiveStoryService,
    private apis: ApisService,
    private storage: StorageService
  ) {}

  async ngOnInit() {
    if (this.panzoom.focusElements) {
      setTimeout(() => {
        this.textarea?.nativeElement.focus()
      }, 0)
    }
  }

  async onAddImage(event: any) {
    const {
      data: { user },
    } = await this.database.supabase.auth.getUser()

    const randomStr = Math.random().toString(36).substring(2, 10)
    const imagePath = `${user.id}/${this.activeStory.storyId()}/${
      this.nodeId
    }-${randomStr}`

    this.loading = true
    this.loadingMessage = 'Optimizing image'

    const optimizedImageBlob = await this.apis.getOptimizedImage(
      event.target.files[0]
    )
    if (!optimizedImageBlob) {
      console.log('Error obtaining optimized image')
      this.loadingMessage =
        'The image is too big\nTry again with a smaller image.'
      this.imageInput?.nativeElement.reset()
      return
    }

    const uploadedImage = await this.storage.uploadImage(
      imagePath,
      optimizedImageBlob
    )

    if (uploadedImage) {
      this.activeStory.addImageToNode(this.nodeId, imagePath)
    } else {
      console.log('Not possible to upload image')
      this.loadingMessage = 'Error uploading the image'
    }

    this.loadingMessage = undefined
    this.loading = false
  }

  async removeNodeImage() {
    const { data, error } = await this.database.supabase.storage
      .from('images')
      .remove([this.image])
    if (error) {
      console.log(error)
    } else {
      this.activeStory.removeImageFromNode(this.nodeId)
    }
  }

  updateShareOptions() {
    this.activeStory.updateNodeShareOptions(this.nodeId, this.shareOptions)
  }

  addAnswer() {
    const newId = generateIDForNewAnswer(this.nodeId, this.answers)
    this.activeStory.createNodeAnswer(this.nodeId, newId)
  }

  addCondition() {
    const newId = generateIDForNewCondition(this.nodeId, this.conditions)
    this.activeStory.createNodeCondition(this.nodeId, newId)
  }

  // Need to do this way because empty links are not saved
  addExternalLink() {
    this.links.push({ name: '', url: '' })
  }

  updateLinks() {
    this.activeStory.updateNodeLinks(this.nodeId, this.links)
  }

  removeAnswer(id: string) {
    this.activeStory.removeAnswer(this.nodeId, id)
    // TODO - Redibujar joins
  }

  removeCondition(id: string) {
    this.activeStory.removeCondition(this.nodeId, id)
  }

  saveNodeText(e: any) {
    const newText = e.target.value
    this.activeStory.updateNodeText(this.nodeId, newText)
  }

  saveProperty(event: any) {
    const newProperty = event.target.value
    this.activeStory.updateNodeProperty(this.nodeId, newProperty)
  }

  savePlaceholder(event: any) {
    const newPlaceholder = event.target.value
    this.activeStory.updateNodePlaceholder(this.nodeId, newPlaceholder)
  }

  saveDescription(event: any) {
    const newDescription = event.target.value
    this.activeStory.updateNodeDescription(this.nodeId, newDescription)
  }

  saveButtonText(event: any) {
    const newButtonText = event.target.value
    this.activeStory.updateNodeButtonText(this.nodeId, newButtonText)
  }

  onDuplicateNode() {
    this.duplicateNode.emit(this.nodeId)
  }

  onRemoveNode() {
    if (this.nodeId === 'node_0') {
      alert('cannot delete node_0')
      return
    }
    const data = {
      nodeId: this.nodeId,
      answers: this.answers?.map((answer) => answer.id),
    }
    this.removeNode.emit(data)

    this.panzoom.resumeDrag()
  }
}
