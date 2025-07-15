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
  @Input() nodeId?: string
  @Input() answerId?: string
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

    if (this.nodeId) {
      this.activeStory.saveNodeEvents(this.nodeId, this.events)
    } else if (this.answerId) {
      this.activeStory.saveAnswerEvents(this.answerId, this.events)
    }
  }

  deleteEvent(event: any) {
    this.events = this.events?.filter((e) => e.target !== event.target)

    if (this.nodeId) {
      this.activeStory.saveNodeEvents(this.nodeId, event)
    } else if (this.answerId) {
      this.activeStory.saveAnswerEvents(this.answerId, event)
    }
  }
}
