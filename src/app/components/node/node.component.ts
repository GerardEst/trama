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
import { SharedBoardService } from 'src/app/components/board/board-utils.service'
import { DatabaseService } from 'src/app/services/database.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
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
@Component({
  selector: 'polo-node',
  standalone: true,
  imports: [
    CommonModule,
    AnswerComponent,
    ConditionComponent,
    FormsModule,
    BasicButtonComponent,
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
  id: string = ''

  // Content of the node
  @Input() text: string = ''
  @Input() answers?: Array<node_answer>
  @Input() conditions?: Array<node_conditions>
  @Input() image?: string
  @Input() links: link[] = []
  @Input() shareOptions: shareOptions = {
    sharedText: '',
  }

  // Functionality of the node
  @Input() waitingForJoin: boolean = false
  @Input() type: 'content' | 'distributor' | 'end' = 'content'

  @Output() onWillJoin: EventEmitter<any> = new EventEmitter()
  @Output() haveJoined: EventEmitter<any> = new EventEmitter()
  @Output() removeNode: EventEmitter<any> = new EventEmitter()
  @ViewChild('textarea') textarea?: ElementRef

  constructor(
    public elementRef: ElementRef,
    private board: SharedBoardService,
    private database: DatabaseService,
    private activeStory: ActiveStoryService
  ) {}

  async ngOnInit() {
    this.id = this.elementRef.nativeElement.id
    if (this.board.focusElements) {
      setTimeout(() => {
        this.textarea?.nativeElement.focus()
      }, 0)
    }
  }

  async onAddImage(event: any) {
    const {
      data: { user },
    } = await this.database.supabase.auth.getUser()

    const image = event.target.files[0]
    const imagePath = `${user.id}/${this.activeStory.storyId()}/${this.id}`

    const { data, error } = await this.database.supabase.storage
      .from('images')
      .upload(imagePath, image, {
        upsert: true,
      })
    if (error) {
      console.log(error)
    } else {
      this.activeStory.addImageToNode(this.id, imagePath)
    }
  }

  async removeNodeImage() {
    const { data, error } = await this.database.supabase.storage
      .from('images')
      .remove([this.image])
    if (error) {
      console.log(error)
    } else {
      this.activeStory.removeImageFromNode(this.id)
    }
  }

  updateSharedText() {
    this.activeStory.updateNodeShareOptions(this.id, this.shareOptions)
  }

  addAnswer() {
    const newId = generateIDForNewAnswer(this.id, this.answers)
    this.activeStory.createNodeAnswer(this.id, newId)
  }

  addCondition() {
    const newId = generateIDForNewCondition(this.id, this.conditions)
    this.activeStory.createNodeCondition(this.id, newId)
  }

  // Need to do this way because empty links are not saved
  addExternalLink() {
    this.links.push({ name: '', url: '' })
  }

  updateLinks() {
    this.activeStory.updateNodeLinks(this.id, this.links)
  }

  removeAnswer(id: string) {
    this.activeStory.removeAnswer(this.id, id)
  }

  removeCondition(id: string) {
    this.activeStory.removeCondition(this.id, id)
  }

  saveNodeText(e: any) {
    const id = this.id
    const newText = e.target.value
    this.activeStory.updateNodeText(id, newText)
  }

  onRemoveNode() {
    this.board.resumeBoardDrag()

    const data = {
      nodeId: this.id,
      answers: this.answers?.map((answer) => answer.id),
    }
    this.removeNode.emit(data)
  }

  willJoin(answerId: string) {
    this.onWillJoin.emit(answerId)
  }

  join() {
    this.haveJoined.emit(this.id)
  }
}
