import { Component, Input } from '@angular/core'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
import { event } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { NodeEventComponent } from './node-event/node-event.component'

@Component({
  selector: 'polo-node-events',
  standalone: true,
  imports: [NodeAddEventComponent, NodeEventComponent],
  templateUrl: './node-events.component.html',
  styleUrl: './node-events.component.sass',
})
export class NodeEventsComponent {
  // La llista dels events que hi ha al node

  @Input() nodeId!: string
  @Input() events?: Array<event>

  openAddEvent: boolean = false

  constructor(private activeStory: ActiveStoryService) {}

  saveEvent(event: any) {
    event.action = event.type === 'stat' ? 'alterStat' : 'alterCondition'

    if (!this.events) this.events = []

    const eventIndex = this.events?.findIndex((e) => e.target === event.target)
    if (eventIndex !== -1) {
      this.events[eventIndex] = event
    } else {
      this.events?.push(event)
    }

    this.activeStory.saveNodeEvents(this.nodeId, this.events)
  }
}
