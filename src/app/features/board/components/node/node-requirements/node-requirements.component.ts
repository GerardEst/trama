import { Input, Component } from '@angular/core'
import { AnchoredPopoverComponent } from 'src/app/shared/components/ui/anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from 'src/app/shared/components/ui/anchored-popover/anchored-popover-content.directive'
import { NodeRequirementComponent } from './node-requirement/node-requirement.component'
import { NodeAddRequirementComponent } from '../context-menus/node-add-requirement/node-add-requirement.component'
import { answer_requirement } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from '../../../services/story-editor.service'
import { getRequirementRefId } from 'src/app/shared/utils/story-requirements'

@Component({
  selector: 'polo-node-requirements',
  standalone: true,
  imports: [AnchoredPopoverComponent, AnchoredPopoverContentDirective, NodeRequirementComponent, NodeAddRequirementComponent],
  templateUrl: './node-requirements.component.html',
  styleUrl: './node-requirements.component.sass',
})
export class NodeRequirementsComponent {
  @Input() answerId: string = ''
  @Input() requirements: answer_requirement[] = []

  constructor(private storyEditor: StoryEditorService) {}

  saveRequirement(element: {
    target: string
    previousValue?: string
    type: answer_requirement['type']
    amount: number | string
  }) {
    const updatedRequirement: answer_requirement = {
      target: element.target,
      type: element.type,
      amount: Number(element.amount),
    }
    const previousTarget = element.previousValue ?? element.target
    const existingIndex = this.requirements.findIndex(
      (requirement) => getRequirementRefId(requirement) === previousTarget
    )

    this.requirements = this.requirements
      .filter(
        (requirement, index) =>
          index === existingIndex ||
          (getRequirementRefId(requirement) !== previousTarget &&
            getRequirementRefId(requirement) !== element.target)
      )
      .map((requirement) =>
        existingIndex !== -1 &&
        getRequirementRefId(requirement) === previousTarget
          ? updatedRequirement
          : requirement
      )
    if (existingIndex === -1)
      this.requirements = [...this.requirements, updatedRequirement]

    this.storyEditor.saveAnswerRequirements(this.answerId, this.requirements)
  }

  deleteRequirement(requirementRefId: string) {
    this.requirements = this.requirements.filter(
      (requirement) => getRequirementRefId(requirement) !== requirementRefId
    )

    this.storyEditor.saveAnswerRequirements(this.answerId, this.requirements)
  }

  getRefId(requirement: answer_requirement): string {
    return getRequirementRefId(requirement) ?? ''
  }
}
