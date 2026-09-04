import { Component, Input } from '@angular/core'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
import { event } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from '../../../services/story-editor.service'
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

  private storyEvents: event[] = []

  @Input()
  set events(events: event[] | undefined) {
    this.storyEvents = structuredClone(events ?? [])
  }
  get events() {
    return this.storyEvents
  }

  openAddEvent: boolean = false

  constructor(private storyEditor: StoryEditorService) {}

  saveEvent(changedEvent: event) {
    const eventToSave: event = {
      ...changedEvent,
      action: changedEvent.type === 'stat' ? 'alterStat' : 'alterCondition',
    }
    const eventIndex = this.storyEvents.findIndex(
      (storyEvent) => storyEvent.target === eventToSave.target
    )

    this.storyEvents =
      eventIndex === -1
        ? [...this.storyEvents, eventToSave]
        : this.storyEvents.map((storyEvent, index) =>
            index === eventIndex ? eventToSave : storyEvent
          )

    this.persistEvents()
  }

  deleteEvent(eventToDelete: event) {
    this.storyEvents = this.storyEvents.filter(
      (storyEvent) => storyEvent.target !== eventToDelete.target
    )
    this.persistEvents()
  }

  private persistEvents() {
    if (this.nodeId) {
      this.storyEditor.saveNodeEvents(this.nodeId, this.storyEvents)
    } else if (this.answerId) {
      this.storyEditor.saveAnswerEvents(this.answerId, this.storyEvents)
    }
  }
}
