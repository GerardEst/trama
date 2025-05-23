import { Component, EventEmitter, Inject, Input, Output } from '@angular/core'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { NodeAddModifyEventComponent } from '../node-add-modify-event/node-add-modify-event.component'

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

  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteEvent: EventEmitter<any> = new EventEmitter()

  @Input() canBeDeleted: boolean = false
  @Input() eventId: string = ''
  @Input() target: string = ''
  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() property?: string
  @Input() amount?: string

  onChangeTarget(event: any) {
    this.target = event.value
  }

  onChangeAmount(event: any) {
    this.amount = event.value
  }

  onChangeProperty(event: any) {
    this.property = event.value
  }

  saveEvent() {
    this.onSaveEvent.emit({
      target: this.target,
      amount: this.amount,
      type: this.type,
      property: this.property,
    })
    this.onClose.emit()
  }

  onCancel() {
    this.onClose.emit()
  }

  deleteEvent() {
    this.onDeleteEvent.emit({
      target: this.target,
      amount: this.amount,
      type: this.type,
      property: this.property,
    })
    this.onClose.emit()
  }
}
