import { Component, Input } from '@angular/core'
import { AnchoredPopoverComponent } from 'src/app/shared/components/ui/anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from 'src/app/shared/components/ui/anchored-popover/anchored-popover-content.directive'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
import { event } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from '../../../services/story-editor.service'
import { NodeEventComponent } from './node-event/node-event.component'

@Component({
  selector: 'polo-node-events',
  standalone: true,
  imports: [AnchoredPopoverComponent, AnchoredPopoverContentDirective, NodeAddEventComponent, NodeEventComponent],
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
  get events(): event[] {
    return this.storyEvents
  }

  constructor(private storyEditor: StoryEditorService) {}

  saveEvent(changedEvent: {
    target: string
    previousTarget?: string
    type: event['type']
    amount?: string | number
    property?: string
  }) {
    const previousTarget = changedEvent.previousTarget ?? changedEvent.target
    const existing = this.storyEvents.find(
      (storyEvent) => storyEvent.target === previousTarget
    )
    const eventToSave: event = {
      id: existing?.id ?? `event_${changedEvent.target}`,
      target: changedEvent.target,
      type: changedEvent.type,
      amount: String(changedEvent.amount ?? ''),
      property: changedEvent.property,
      action:
        changedEvent.type === 'stat'
          ? 'alterStat'
          : changedEvent.type === 'condition'
            ? 'alterCondition'
            : 'alterProperty',
    }

    // An edited target replaces the old event; a target can only have one event.
    this.storyEvents = [
      ...this.storyEvents.filter(
        (storyEvent) =>
          storyEvent.target !== previousTarget &&
          storyEvent.target !== eventToSave.target
      ),
      eventToSave,
    ]
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
