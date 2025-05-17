import { Component, EventEmitter, Inject, Input, Output } from '@angular/core'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { NodeAddModifyEventComponent } from '../node-add-modify-event/node-add-modify-event.component'
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

  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()

  @Input() eventId: string = ''
  @Input() target: string = ''
  @Input() type: 'stat' | 'condition' = 'stat'
  @Input() amount?: string

  onChangeTarget(event: any) {
    this.target = event.value.value
  }

  onChangeAmount(event: any) {
    this.amount = event.value
  }

  saveEvent() {
    this.onSaveEvent.emit({
      target: this.target,
      amount: this.amount,
      type: this.type,
    })
    this.onClose.emit()
  }

  onCancel() {
    this.onClose.emit()
  }
}
