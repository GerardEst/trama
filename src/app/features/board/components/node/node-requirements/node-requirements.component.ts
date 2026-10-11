import { Input, Component } from '@angular/core'
import { AnchoredPopoverComponent } from 'src/app/shared/components/ui/anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from 'src/app/shared/components/ui/anchored-popover/anchored-popover-content.directive'
import { NodeRequirementComponent } from './node-requirement/node-requirement.component'
import { NodeAddRequirementComponent } from '../context-menus/node-add-requirement/node-add-requirement.component'
import { answer_requirement } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from '../../../services/story-editor.service'
import { RequirementChange } from '../../../services/story-logic-changes'
import { getRequirementRefId } from 'src/app/shared/utils/story-requirements'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ContextualButtonComponent } from 'src/app/shared/components/ui/contextual-button/contextual-button.component'
import { ContextHelpComponent } from 'src/app/shared/context-help/context-help.component'

@Component({
  selector: 'polo-node-requirements',
  standalone: true,
  imports: [ContextualButtonComponent, AnchoredPopoverComponent, AnchoredPopoverContentDirective, NodeRequirementComponent, NodeAddRequirementComponent, TranslatePipe, ContextHelpComponent],
  templateUrl: './node-requirements.component.html',
  styleUrl: './node-requirements.component.css',
})
export class NodeRequirementsComponent {
  @Input() showAddButton = true
  @Input() answerId: string = ''
  @Input() requirements: answer_requirement[] = []

  constructor(private storyEditor: StoryEditorService) {}

  saveRequirement(change: RequirementChange) {
    this.storyEditor.upsertAnswerRequirement(this.answerId, change)
  }

  deleteRequirement(requirementRefId: string) {
    this.storyEditor.deleteAnswerRequirement(this.answerId, requirementRefId)
  }

  getRefId(requirement: answer_requirement): string {
    return getRequirementRefId(requirement) ?? ''
  }
}
