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
import { node_conditions } from 'src/app/interfaces'
import { FormsModule } from '@angular/forms'
import { link, shareOptions } from 'src/app/interfaces'
import { SharedBoardService } from 'src/app/services/shared-board-service'
import { DatabaseService } from 'src/app/services/database.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'

interface answer {
  id: string
  text: string
}
interface position {
  x: number
  y: number
}

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
export class NodeComponent {
  @Input() text: string = ''
  @Input() answers?: Array<answer>
  @Input() conditions?: Array<node_conditions>
  @Input() position: position = { x: 0, y: 0 }
  @Input() waitingForJoin: boolean = false
  @Input() type: 'content' | 'distributor' | 'end' = 'content'
  @Input() shareOptions: shareOptions = {
    sharedText: '',
  }
  @Input() image?: string

  @Input() links: link[] = []
  @Output() onWillJoin: EventEmitter<any> = new EventEmitter()
  @Output() haveJoined: EventEmitter<any> = new EventEmitter()
  @Output() removeNode: EventEmitter<any> = new EventEmitter()
  @ViewChild('textarea') textarea?: ElementRef
  // imagePath?: string | undefined

  constructor(
    public elementRef: ElementRef,
    private board: SharedBoardService,
    private database: DatabaseService,
    private activeStory: ActiveStoryService
  ) {}

  async ngOnInit() {
    if (this.board.focusElements) {
      setTimeout(() => {
        this.textarea?.nativeElement.focus()
      }, 0)
    }
    //this.imagePath = await this.getImagePath()
  }

  // async getImagePath() {
  //   const image = this.activeStory.getImageFromNode(
  //     this.elementRef.nativeElement.id
  //   )
  //   if (!image) return

  //   return (
  //     'https://lsemostpqoguehpsbzgu.supabase.co/storage/v1/object/public/images/' +
  //     image.path
  //   )
  // }

  async onAddImage(event: any) {
    const {
      data: { user },
    } = await this.database.supabase.auth.getUser()

    const image = event.target.files[0]
    const imagePath = `${user.id}/${this.activeStory.storyId()}/${
      this.elementRef.nativeElement.id
    }`

    const { data, error } = await this.database.supabase.storage
      .from('images')
      .upload(imagePath, image, {
        upsert: true,
      })
    if (error) {
      console.log(error)
    } else {
      // Handle success
      this.activeStory.addImageToNode(
        this.elementRef.nativeElement.id,
        imagePath
      )

      this.image = imagePath
    }
  }

  async removeNodeImage() {
    const { data, error } = await this.database.supabase.storage
      .from('images')
      .remove([this.image])
    if (error) {
      console.log(error)
    } else {
      this.image = undefined
      this.activeStory.removeImageFromNode(this.elementRef.nativeElement.id)
    }
  }

  updateSharedText() {
    this.activeStory.updateNodeShareOptions(
      this.elementRef.nativeElement.id,
      this.shareOptions
    )
  }

  addAnswer() {
    const newId = `answer_${
      this.elementRef.nativeElement.id.split('_')[1]
    }_${this.getIDForNewAnswer()}`

    if (!this.answers) this.answers = []

    this.answers.push({ id: newId, text: '' })

    this.activeStory.createNodeAnswer(this.elementRef.nativeElement.id, newId)
  }

  addCondition() {
    const newId = `condition_${
      this.elementRef.nativeElement.id.split('_')[1]
    }_${this.getIDForNewCondition()}`

    if (!this.conditions) this.conditions = []

    this.conditions.push({
      id: newId,
      join: [],
      ref: '',
      comparator: '',
      value: '0',
    })

    this.activeStory.createNodeCondition(
      this.elementRef.nativeElement.id,
      newId
    )
  }

  addExternalLink() {
    this.links.push({ name: '', url: '' })
  }

  updateLinks() {
    this.activeStory.updateNodeLinks(
      this.elementRef.nativeElement.id,
      this.links
    )
  }

  removeAnswer(id: string) {
    this.activeStory.removeAnswer(this.elementRef.nativeElement.id, id)
    this.answers = this.answers?.filter((answer: any) => answer.id !== id)
  }

  removeCondition(id: string) {
    this.activeStory.removeCondition(this.elementRef.nativeElement.id, id)
    this.conditions = this.conditions?.filter(
      (condition: any) => condition.id !== id
    )
  }

  saveNodeText(e: any) {
    const id = this.elementRef.nativeElement.id
    const newText = e.target.value

    this.activeStory.updateNodeText(id, newText)
  }

  getIDForNewAnswer() {
    let answer_ids = []

    const answers = this.activeStory.getAnswersOfNode(
      this.elementRef.nativeElement.id
    )

    if (!answers) return 0

    for (let answer of answers) answer_ids.push(answer.id.split('_')[2])

    const great_id = Math.max(...answer_ids) > 0 ? Math.max(...answer_ids) : 0

    return great_id + 1
  }

  getIDForNewCondition() {
    let condition_ids = []

    const conditions = this.activeStory.getConditionsOfNode(
      this.elementRef.nativeElement.id
    )

    if (!conditions) return 0

    for (let condition of conditions)
      condition_ids.push(condition.id.split('_')[2])

    const great_id =
      Math.max(...condition_ids) > 0 ? Math.max(...condition_ids) : 0

    return great_id + 1
  }

  onRemoveNode() {
    this.board.resumeBoardDrag()

    const data = {
      nodeId: this.elementRef.nativeElement.id,
      answers: this.answers?.map((answer) => answer.id),
    }
    this.removeNode.emit(data)
  }

  willJoin(answerId: string) {
    this.onWillJoin.emit(answerId)
  }

  join() {
    this.haveJoined.emit(this.elementRef.nativeElement.id)
  }
}
