import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  OnInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { DividerComponent } from '../../../../shared/components/ui/divider/divider.component'
import { EventsManagerComponent } from '../events-manager/events-manager.component'
import { RequirementsManagerComponent } from '../requirements-manager/requirements-manager.component'
import { JoinsManagerComponent } from '../joins-manager/joins-manager.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
@Component({
  selector: 'polo-popup-answer-options',
  standalone: true,
  imports: [
    CommonModule,
    DividerComponent,
    EventsManagerComponent,
    RequirementsManagerComponent,
    JoinsManagerComponent,
    BasicButtonComponent,
  ],
  templateUrl: './popup-answer-options.component.html',
  styleUrls: ['./popup-answer-options.component.sass'],
})
export class PopupAnswerOptionsComponent implements OnInit {
  @Output() onRemoveAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onClosePopup: EventEmitter<any> = new EventEmitter()
  @Input() answerId: string = ''
  joins: Array<any> = []

  constructor(
    public elementRef: ElementRef,
    private activeStory: ActiveStoryService
  ) {}

  ngOnInit(): void {
    if (this.answerId) {
      this.joins = this.activeStory.getJoinsOfAnswer(this.answerId) || []
    }
  }

  updateJoins(joins: Array<any>) {
    this.joins = joins
  }

  removeAnswer() {
    const id = this.answerId
    this.onRemoveAnswer.emit(id)
  }

  closePopup() {
    this.onClosePopup.emit()
  }
}
