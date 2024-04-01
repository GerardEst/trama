import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RequirementComponent } from '../requirement/requirement.component'
import { DropdownButtonsComponent } from '../ui/dropdown-button/dropdown-buttons.component'
import { StorageService } from 'src/app/services/storage.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
interface requirement {
  id?: string
  name?: string
  amount?: number
  type?: 'stat' | 'condition'
}

@Component({
  selector: 'polo-requirements-manager',
  standalone: true,
  imports: [
    CommonModule,
    RequirementComponent,
    DropdownButtonsComponent,
    BasicButtonComponent,
  ],
  templateUrl: './requirements-manager.component.html',
  styleUrls: ['./requirements-manager.component.sass'],
})
export class RequirementsManagerComponent {
  requirements: Array<requirement> = []
  @Input() answerId: string = ''

  constructor(
    private storage: StorageService,
    private activeStory: ActiveStoryService
  ) {}

  ngOnInit() {
    if (this.answerId) {
      this.requirements =
        this.storage.getRequirementsOfAnswer(this.answerId) || []
    }
  }

  createRequirement(type: 'stat' | 'condition') {
    /** If this is a stat, we push an amount with emptyness and nothing
     * gets added to the tree till the user selects an option
     */
    this.requirements.push({
      amount: 1,
      type,
    })
  }

  updateRequirementElement(element: any) {
    const requirement = this.requirements.find(
      (requirement) => requirement.id === element.previousValue
    )
    if (requirement) requirement.id = element.value

    // I have to send the answer id and the new requirement id
    this.storage.saveAnswerRequirements(this.answerId, this.requirements)

    this.activeStory.addRef(
      'requirement',
      {
        id: element.value,
        answer: this.answerId,
      },
      {
        id: element.previousValue,
        answer: this.answerId,
      }
    )
  }

  updateRequirementAmount(options: any) {
    const requirementId = options.id
    const amount = parseInt(options.value)

    const requirement = this.requirements.find(
      (req) => req.id === requirementId
    )
    if (requirement) requirement.amount = amount

    this.storage.saveAnswerRequirements(this.answerId, this.requirements)
  }

  deleteRequirement(requirementId: string) {
    this.requirements = this.requirements.filter((requirement: any) => {
      return requirement.id !== requirementId
    })

    this.storage.deleteRequirementFromAnswer(this.answerId, requirementId)
    this.activeStory.removeRef('requirement', {
      id: requirementId,
      answer: this.answerId,
    })
  }
}
