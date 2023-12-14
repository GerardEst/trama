import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { StorageService } from 'src/app/services/storage.service'

@Component({
  selector: 'polo-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.sass'],
})
export class AnswerComponent {
  @Input() nodeId: string = ''
  @Input() text: string = ''
  @Output() onRemoveAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onWillJoin: EventEmitter<any> = new EventEmitter()

  constructor(private storage: StorageService, public elementRef: ElementRef) {}

  saveAnswerText(e: any) {
    const id = this.elementRef.nativeElement.id
    const text = e.target.value

    this.storage.updateAnswerText(id, text)
  }

  removeAnswer() {
    const id = this.elementRef.nativeElement.id

    this.onRemoveAnswer.emit(id)
  }

  willJoin() {
    this.onWillJoin.emit(this.elementRef.nativeElement.id)
  }
}
