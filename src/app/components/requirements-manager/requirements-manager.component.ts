import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RequirementComponent } from '../ui/requirement/requirement.component'
import { DropdownButtonsComponent } from '../ui/dropdown-button/dropdown-buttons.component'
import { StorageService } from 'src/app/services/storage.service'

interface element {
  id: string
  name: string
}

interface requirement {
  id?: string
  name?: string
  amount?: number
  type?: 'stat' | 'condition'
}

@Component({
  selector: 'polo-requirements-manager',
  standalone: true,
  imports: [CommonModule, RequirementComponent, DropdownButtonsComponent],
  templateUrl: './requirements-manager.component.html',
  styleUrls: ['./requirements-manager.component.sass'],
})
export class RequirementsManagerComponent {
  requirements: Array<requirement> = []
  @Input() answerId: string = ''

  constructor(private storage: StorageService) {}

  ngOnInit() {
    if (this.answerId) {
      this.requirements =
        this.storage.getRequirementsOfAnswer(this.answerId) || []
    }
    console.log(this.requirements)
  }

  createRequirement(type: 'stat' | 'condition') {
    /** A new requirement shouldn't have id or anything selected
     * The amount might be 1, but the selector is empty.
     *
     * Then when the user selects an element on the selector, it calls the updateRequirementElement as always
     * And maybe it finds the element with undefined id and everything works?
     *
     */
    // const id = 'requirement_' + this.storage.getNewIdForRequirement()
    const amount = 1
    // const name = 'New ' + type
    this.requirements.push({
      //id,
      //name,
      amount,
      //type,
    })

    // this.storage.addRequirementToAnswer(this.answerId, {
    //   id,
    //   amount,
    //   type,
    // })

    // this.storage.saveRequirementDetails(id, {
    //   name,
    // })
  }

  updateRequirementElement(event: any) {
    /** Here we receive the previous value and the new value
     * We can update the this.requirements
     */
    const requirement = this.requirements.find(
      (requirement) => requirement.id === event.previousValue
    )
    if (requirement) requirement.id = event.value

    // I have to send the answer id and the new requirement id
    this.storage.saveAnswerRequirements(this.answerId, this.requirements)
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
  }
}
