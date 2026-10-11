import { Component, Input } from '@angular/core'
import { AnchoredPopoverComponent } from 'src/app/shared/components/ui/anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from 'src/app/shared/components/ui/anchored-popover/anchored-popover-content.directive'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
import { event } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from '../../../services/story-editor.service'
import { EventChange } from '../../../services/story-logic-changes'
import { NodeEventComponent } from './node-event/node-event.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ContextualButtonComponent } from 'src/app/shared/components/ui/contextual-button/contextual-button.component'
import { ContextHelpComponent } from 'src/app/shared/context-help/context-help.component'

@Component({
  selector: 'polo-node-events',
  standalone: true,
  imports: [ContextualButtonComponent, AnchoredPopoverComponent, AnchoredPopoverContentDirective, NodeAddEventComponent, NodeEventComponent, TranslatePipe, ContextHelpComponent],
  templateUrl: './node-events.component.html',
  styleUrl: './node-events.component.css',
})
export class NodeEventsComponent {
  @Input() showAddButton = true
  @Input() nodeId?: string
  @Input() answerId?: string

  @Input() events: event[] = []

  constructor(private storyEditor: StoryEditorService) {}

  saveEvent(change: EventChange) {
    if (this.nodeId) this.storyEditor.upsertNodeEvent(this.nodeId, change)
    else if (this.answerId) this.storyEditor.upsertAnswerEvent(this.answerId, change)
  }

  deleteEvent(change: Pick<EventChange, 'target'>) {
    if (this.nodeId) this.storyEditor.deleteNodeEvent(this.nodeId, change.target)
    else if (this.answerId) this.storyEditor.deleteAnswerEvent(this.answerId, change.target)
  }
}
