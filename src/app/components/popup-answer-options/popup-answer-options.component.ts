import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  OnInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { DividerComponent } from '../ui/divider/divider.component'
import { EventsManagerComponent } from '../events-manager/events-manager.component'
import { RequirementsManagerComponent } from '../requirements-manager/requirements-manager.component'
import { JoinsManagerComponent } from '../joins-manager/joins-manager.component'
import { StorageService } from 'src/app/services/storage.service'

@Component({
  selector: 'polo-popup-answer-options',
  standalone: true,
  imports: [
    CommonModule,
    DividerComponent,
    EventsManagerComponent,
    RequirementsManagerComponent,
    JoinsManagerComponent,
  ],
  templateUrl: './popup-answer-options.component.html',
  styleUrls: ['./popup-answer-options.component.sass'],
})
export class PopupAnswerOptionsComponent implements OnInit {
  @Output() onRemoveAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onClosePopup: EventEmitter<any> = new EventEmitter()
  @Input() answerId: string = ''
  joins: Array<any> = []

  constructor(public elementRef: ElementRef, private storage: StorageService) {}

  ngOnInit(): void {
    if (this.answerId) {
      this.joins = this.storage.getJoinsOfAnswer(this.answerId) || []
    }
  }

  updateJoins(joins: Array<any>) {
    this.joins = joins
  }

  // Aqui s'hauria d'enviar un event que ve de events-manager?

  removeAnswer() {
    const id = this.answerId
    this.onRemoveAnswer.emit(id)
  }

  closePopup() {
    this.onClosePopup.emit()
  }
}
