import { Component } from '@angular/core'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { NodeAddModifyEventComponent } from '../../node-events/node-add-modify-event/node-add-modify-event.component'

@Component({
  selector: 'polo-node-add-event',
  standalone: true,
  imports: [NodeAddModifyEventComponent],
  templateUrl: './node-add-event.component.html',
  styleUrl: './node-add-event.component.sass',
})
export class NodeAddEventComponent extends PopupBaseComponent {
  eventType: 'stat' | 'condition' = 'stat'
  eventId: string = ''
  eventAmount?: number

  addEvent() {
    console.log('addEvent')
  }

  onCancel() {
    super.closePopup()
  }
}
