import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { DividerComponent } from '../ui/divider/divider.component'
import { EventsManagerComponent } from '../events-manager/events-manager.component'
import { RequirementsManagerComponent } from '../requirements-manager/requirements-manager.component'

@Component({
  selector: 'polo-popup-answer-options',
  standalone: true,
  imports: [
    CommonModule,
    DividerComponent,
    EventsManagerComponent,
    RequirementsManagerComponent,
  ],
  templateUrl: './popup-answer-options.component.html',
  styleUrls: ['./popup-answer-options.component.sass'],
})
export class PopupAnswerOptionsComponent {
  @Output() onRemoveAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onClosePopup: EventEmitter<any> = new EventEmitter()
  @Input() answerId: string = ''

  constructor(public elementRef: ElementRef) {}

  removeAnswer() {
    const id = this.answerId
    this.onRemoveAnswer.emit(id)
  }

  closePopup() {
    this.onClosePopup.emit()
  }
}
