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
import { PopupManagerService } from 'src/app/services/popup-manager.service'

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
  @ViewChild('requirementContainer', { read: ViewContainerRef })
  requirementContainer?: ViewContainerRef
  optionsOpened: Boolean = false

  constructor(
    private storage: StorageService,
    public elementRef: ElementRef,
    private popup: PopupManagerService
  ) {}

  openOptions() {
    this.optionsOpened = true
  }

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
    if (!this.requirementContainer) return

    const ref = this.requirementContainer.createComponent(
      EventsManagerComponent
    )
    ref.instance.answerId = this.elementRef.nativeElement.id

    // Listen for the close event
    this.subscription = ref.instance.onClose.subscribe(() => {
      ref.destroy()
    })

    // Use the service to set the current component
    this.popup.setCurrentComponent(ref)
  }

  manageRequirements() {
    if (!this.requirementContainer) return

    const ref = this.requirementContainer.createComponent(
      RequirementsManagerComponent
    )
    ref.instance.answerId = this.elementRef.nativeElement.id

    // Listen for the close event
    this.subscription = ref.instance.onClose.subscribe(() => {
      ref.destroy()
    })

    // Use the service to set the current component
    this.popup.setCurrentComponent(ref)
  }

  willJoin() {
    this.onWillJoin.emit(this.elementRef.nativeElement.id)
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
