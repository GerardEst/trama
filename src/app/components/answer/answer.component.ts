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
import { PopupAnswerOptionsComponent } from '../popup-answer-options/popup-answer-options.component'
import { PanzoomService } from 'src/app/services/panzoom.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Component({
  selector: 'polo-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.sass'],
})
export class AnswerComponent {
  id: string = ''

  @Input() text: string = ''
  @Output() onRemoveAnswer: EventEmitter<any> = new EventEmitter()
  @ViewChild('optionsContainer', { read: ViewContainerRef })
  optionsContainer?: ViewContainerRef
  @ViewChild('textarea') textarea?: ElementRef

  constructor(
    private activeStory: ActiveStoryService,
    public elementRef: ElementRef,
    private panzoom: PanzoomService
  ) {}

  ngOnInit() {
    this.id = this.elementRef.nativeElement.id
    if (this.panzoom.focusElements) {
      setTimeout(() => {
        const textarea = this.textarea
        if (textarea) textarea.nativeElement.focus()
      }, 0)
    }
  }
  openOptions() {
    if (!this.optionsContainer) return

    // Create the component
    const ref = this.optionsContainer.createComponent(
      PopupAnswerOptionsComponent
    )
    ref.instance.answerId = this.id

    // Manage subscriptions to talk with answer component, because this is a dinamically created component
    const subscriptions: Array<any> = []
    subscriptions.push(
      ref.instance.onRemoveAnswer.subscribe(() => {
        this.panzoom.resumeDrag()
        this.removeAnswer()
      }),
      ref.instance.onClosePopup.subscribe(() => {
        this.panzoom.resumeDrag()
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
    const text = e.target.value
    this.activeStory.updateAnswerText(this.id, text)
  }

  removeAnswer() {
    this.onRemoveAnswer.emit(this.id)
  }
}
