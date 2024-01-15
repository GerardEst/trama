import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { StorageService } from 'src/app/services/storage.service'
import { PopupAnswerOptionsComponent } from '../popup-answer-options/popup-answer-options.component'
import { SharedBoardService } from 'src/app/services/shared-board-service'

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
  @ViewChild('optionsContainer', { read: ViewContainerRef })
  optionsContainer?: ViewContainerRef

  constructor(
    private storage: StorageService,
    public elementRef: ElementRef,
    private sharedBoard: SharedBoardService
  ) {}

  openOptions() {
    if (!this.optionsContainer) return

    // Create the component
    const ref = this.optionsContainer.createComponent(
      PopupAnswerOptionsComponent
    )
    ref.instance.answerId = this.elementRef.nativeElement.id

    // Manage subscriptions to talk with answer component, because this is a dinamically created component
    const subscriptions: Array<any> = []
    subscriptions.push(
      ref.instance.onRemoveAnswer.subscribe(() => {
        this.sharedBoard.resumeBoardDrag()
        this.removeAnswer()
      }),
      ref.instance.onClosePopup.subscribe(() => {
        this.sharedBoard.resumeBoardDrag()
        ref.destroy()
        for (let subscription of subscriptions) {
          // I checked that if we don't unsubscribe, the subscription status closed is false even when I close the popup.
          // So this is necessary
          subscription.unsubscribe()
        }
      })
    )
  }

  saveAnswerText(e: any) {
    const id = this.elementRef.nativeElement.id
    const text = e.target.value

    this.storage.updateAnswerText(id, text)
  }

  willJoin() {
    this.onWillJoin.emit(this.elementRef.nativeElement.id)
  }

  removeAnswer() {
    const id = this.elementRef.nativeElement.id

    this.onRemoveAnswer.emit(id)
  }
}
