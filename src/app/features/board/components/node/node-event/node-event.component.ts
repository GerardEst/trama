import { Component, Input } from '@angular/core'
import { event } from 'src/app/core/interfaces/interfaces'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
@Component({
  selector: 'polo-node-event',
  standalone: true,
  imports: [NodeAddEventComponent],
  templateUrl: './node-event.component.html',
  styleUrl: './node-event.component.sass',
})
export class NodeEventComponent {
  @Input() event!: event

  openModifyEvent: boolean = false

  modifyEvent(event: any) {
    console.log(event)
  }
}
