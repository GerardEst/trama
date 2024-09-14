import {
  Component,
  Input,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { AnswerComponent } from '../answer/answer.component'
import { ConditionComponent } from '../condition/condition.component'
import { FormsModule } from '@angular/forms'
import { PanzoomService } from 'src/app/services/panzoom.service'
import { DatabaseService } from 'src/app/services/database.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { ImageComponent } from 'src/app/components/ui/image/image.component'
import {
  link,
  shareOptions,
  node_answer,
  node_conditions,
} from 'src/app/interfaces'
import {
  generateIDForNewAnswer,
  generateIDForNewCondition,
} from 'src/app/utils/tree-searching'
import { ApisService } from 'src/app/services/apis.service'
import { StorageService } from 'src/app/services/storage.service'

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

  // Content of the node
  @Input() text: string = ''
  @Input() answers?: Array<node_answer>
  @Input() conditions?: Array<node_conditions>
  @Input() image?: string
  @Input() links: link[] = []
  @Input() shareOptions: shareOptions = {
    sharedText: '',
    shareButtonText: '',
  }

  loading: boolean = false
  loadingMessage?: string

  @Input() type: 'content' | 'distributor' | 'end' = 'content'
  @Output() duplicateNode: EventEmitter<any> = new EventEmitter()
  @Output() removeNode: EventEmitter<any> = new EventEmitter()

  @ViewChild('textarea') textarea?: ElementRef
  @ViewChild('imageInput') imageInput?: ElementRef

  constructor(
    public elementRef: ElementRef,
    private panzoom: PanzoomService,
    private database: DatabaseService,
    private activeStory: ActiveStoryService,
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

  onDuplicateNode() {
    this.duplicateNode.emit(this.nodeId)
  }

  onRemoveNode() {
    const data = {
      nodeId: this.nodeId,
      answers: this.answers?.map((answer) => answer.id),
    }
    this.removeNode.emit(data)

    this.panzoom.resumeDrag()
  }
}
