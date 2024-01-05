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
import { PopupManagerService } from 'src/app/services/popup-manager.service'
import { PopupAnswerOptionsComponent } from '../popup-answer-options/popup-answer-options.component'

@Component({
  selector: 'polo-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.sass'],
})
export class AnswerComponent {
  private subscription: any
  @Input() nodeId: string = ''
  @Input() text: string = ''
  @Output() onRemoveAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onWillJoin: EventEmitter<any> = new EventEmitter()
  @ViewChild('optionsContainer', { read: ViewContainerRef })
  optionsContainer?: ViewContainerRef

  constructor(
    private storage: StorageService,
    public elementRef: ElementRef,
    private popup: PopupManagerService
  ) {}

  openOptions() {
    if (!this.optionsContainer) return

    const ref = this.optionsContainer.createComponent(
      PopupAnswerOptionsComponent
    )
    ref.instance.answerId = this.elementRef.nativeElement.id
    this.subscription = ref.instance.onRemoveAnswer.subscribe(() => {
      this.removeAnswer()
    })

    this.popup.setCurrentComponent(ref)
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
