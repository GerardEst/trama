import {
  Component,
  Input,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { StorageService } from 'src/app/services/storage.service'
import { AnswerComponent } from '../answer/answer.component'
import { ConditionComponent } from '../condition/condition.component'
import { condition } from 'src/app/interfaces'

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
  imports: [CommonModule, AnswerComponent, ConditionComponent],
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.sass'],
})
export class NodeComponent {
  @Input() text: string = ''
  @Input() answers?: Array<answer>
  @Input() conditions?: Array<condition>
  @Input() position: position = { x: 0, y: 0 }
  @Input() waitingForJoin: boolean = false
  @Input() type: 'content' | 'distributor' | 'end' = 'content'
  @Output() onWillJoin: EventEmitter<any> = new EventEmitter()
  @Output() haveJoined: EventEmitter<any> = new EventEmitter()
  @Output() removeNode: EventEmitter<any> = new EventEmitter()
  @ViewChild('textarea') textarea?: ElementRef

  constructor(public storage: StorageService, public elementRef: ElementRef) {}

  ngOnInit() {
    setTimeout(() => {
      this.textarea?.nativeElement.focus()
    }, 0)
  }

  addAnswer() {
    const newId = `answer_${
      this.elementRef.nativeElement.id.split('_')[1]
    }_${this.getIDForNewAnswer()}`

    if (!this.answers) this.answers = []

    this.answers.push({ id: newId, text: '' })

    this.storage.createNodeAnswer(this.elementRef.nativeElement.id, newId)
  }

  addCondition() {
    const newId = `condition_${
      this.elementRef.nativeElement.id.split('_')[1]
    }_${this.getIDForNewCondition()}`

    if (!this.conditions) this.conditions = []

    this.conditions.push({
      id: newId,
      ref: '',
      comparator: '',
      value: 0,
    })

    this.storage.createNodeCondition(this.elementRef.nativeElement.id, newId)
  }

  removeAnswer(id: string) {
    this.storage.removeAnswer(this.elementRef.nativeElement.id, id)
    this.answers = this.answers?.filter((answer: any) => answer.id !== id)
  }

  removeCondition(id: string) {
    this.storage.removeCondition(this.elementRef.nativeElement.id, id)
    this.conditions = this.conditions?.filter(
      (condition: any) => condition.id !== id
    )
  }

  saveNodeText(e: any) {
    const id = this.elementRef.nativeElement.id
    const newText = e.target.value

    this.storage.updateNodeText(id, newText)
  }

  getIDForNewAnswer() {
    let answer_ids = []

    const answers = this.storage.getAnswersOfNode(
      this.elementRef.nativeElement.id
    )

    if (!answers) return 0

    for (let answer of answers) answer_ids.push(answer.id.split('_')[2])

    const great_id = Math.max(...answer_ids) > 0 ? Math.max(...answer_ids) : 0

    return great_id + 1
  }

  getIDForNewCondition() {
    let condition_ids = []

    const conditions = this.storage.getConditionsOfNode(
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
