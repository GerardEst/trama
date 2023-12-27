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
import { RequirementsManagerComponent } from '../requirements-manager/requirements-manager.component'
import { EventsManagerComponent } from '../events-manager/events-manager.component'

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
  @ViewChild('requirementContainer', { read: ViewContainerRef })
  requirementContainer?: ViewContainerRef

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

  manageEvents() {
    const ref = this.requirementContainer?.createComponent(
      EventsManagerComponent
    )
    //@ts-ignore
    ref.instance.answerId = this.elementRef.nativeElement.id
  }

  manageRequirements() {
    const ref = this.requirementContainer?.createComponent(
      RequirementsManagerComponent
    )
    //@ts-ignore
    ref.instance.answerId = this.elementRef.nativeElement.id
  }

  willJoin() {
    this.onWillJoin.emit(this.elementRef.nativeElement.id)
  }
}
