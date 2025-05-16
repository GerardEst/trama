import { Component } from '@angular/core'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'

@Component({
  selector: 'polo-node-events',
  standalone: true,
  imports: [BasicButtonComponent, NodeAddEventComponent],
  templateUrl: './node-events.component.html',
  styleUrl: './node-events.component.sass',
})
export class NodeEventsComponent {
  openAddEvent: boolean = false
}
