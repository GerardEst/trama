import { Component, EventEmitter, Inject, Input, Output } from '@angular/core'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { NodeAddModifyEventComponent } from '../../node-events/node-add-modify-event/node-add-modify-event.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

@Component({
  selector: 'polo-node-add-event',
  standalone: true,
  imports: [NodeAddModifyEventComponent],
  templateUrl: './node-add-event.component.html',
  styleUrl: './node-add-event.component.sass',
})
export class NodeAddEventComponent extends PopupBaseComponent {
  // El popup per configurar l'event
  // S'obre al crear i modificar events

  @Inject(ActiveStoryService) private activeStory!: ActiveStoryService

  @Output() onModifyEvent: EventEmitter<any> = new EventEmitter()
  @Output() onCreateNewEvent: EventEmitter<any> = new EventEmitter()
  @Input() eventId: string = ''
  @Input() eventType: 'stat' | 'condition' = 'stat'
  @Input() eventAmount?: number

  onChangeElement(event: any) {
    this.eventId = event.value.value
    this.eventAmount = event.amount

    this.onModifyEvent.emit({
      eventId: this.eventId,
      eventAmount: this.eventAmount,
    })
  }

  onChangeAmount(event: any) {
    this.eventAmount = event.amount

    this.onModifyEvent.emit({
      eventId: this.eventId,
      eventAmount: this.eventAmount,
    })
  }

  addEvent() {
    this.onCreateNewEvent.emit({
      eventId: this.eventId,
      eventAmount: this.eventAmount,
    })
    this.onClose.emit()
  }

  onCancel() {
    this.onClose.emit()
  }
}
