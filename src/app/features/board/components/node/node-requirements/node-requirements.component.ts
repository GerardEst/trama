import { Input, Component } from '@angular/core'
import { NodeRequirementComponent } from './node-requirement/node-requirement.component'
import { NodeAddRequirementComponent } from '../context-menus/node-add-requirement/node-add-requirement.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

@Component({
  selector: 'polo-node-requirements',
  standalone: true,
  imports: [NodeRequirementComponent, NodeAddRequirementComponent],
  templateUrl: './node-requirements.component.html',
  styleUrl: './node-requirements.component.sass',
})
export class NodeRequirementsComponent {
  @Input() answerId: string = ''
  @Input() requirements: Array<any> = []

  openAddRequirement: boolean = false

  constructor(private activeStory: ActiveStoryService) {}

  saveRequirement(element: any) {
    const requirement = this.requirements.find(
      (requirement) => requirement.id === element.previousValue
    )
    if (requirement) {
      requirement.target = element.target
      requirement.type = element.type
      requirement.amount = element.amount
    } else {
      this.requirements.push({
        target: element.target,
        type: element.type,
        amount: element.amount,
      })
    }

    this.activeStory.saveAnswerRequirements(this.answerId, this.requirements)

    this.activeStory.addRef(
      'requirement',
      {
        id: element.target,
        answer: this.answerId,
      },
      {
        id: element.previousValue,
        answer: this.answerId,
      }
    )
  }

  deleteRequirement(requirementTarget: string) {
    this.requirements = this.requirements.filter((requirement: any) => {
      return requirement.target !== requirementTarget
    })

    this.activeStory.saveAnswerRequirements(this.answerId, this.requirements)

    this.activeStory.removeRef('requirement', {
      id: requirementTarget,
      answer: this.answerId,
    })
  }
}
