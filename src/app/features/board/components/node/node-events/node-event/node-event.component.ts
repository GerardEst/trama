import { Component, EventEmitter, Input, Output } from '@angular/core'
import { event } from 'src/app/core/interfaces/interfaces'
import { NodeAddEventComponent } from '../../context-menus/node-add-event/node-add-event.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
@Component({
  selector: 'polo-node-event',
  standalone: true,
  imports: [NodeAddEventComponent],
  templateUrl: './node-event.component.html',
  styleUrl: './node-event.component.sass',
})
export class NodeEventComponent {
  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()
  @Input() event!: event

  constructor(private activeStory: ActiveStoryService) {}

  openModifyEvent: boolean = false

  saveEvent(event: any) {
    this.onSaveEvent.emit(event)
  }
}
