import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DropdownButtonsComponent } from '../ui/dropdown-button/dropdown-buttons.component'
import { RequirementComponent } from '../ui/requirement/requirement.component'
import { StorageService } from 'src/app/services/storage.service'

interface requirement {
  id: string
  name: string
  amount: number
  type: 'stat' | 'condition'
}

@Component({
  selector: 'polo-requirements-manager',
  standalone: true,
  imports: [CommonModule, DropdownButtonsComponent, RequirementComponent],
  templateUrl: './requirements-manager.component.html',
  styleUrls: ['./requirements-manager.component.sass'],
})
export class RequirementsManagerComponent {
  requirements: Array<requirement> = []
  @Input() answerId: string = ''
  @Output() onClose: EventEmitter<any> = new EventEmitter()

  constructor(private storage: StorageService) {}

  ngOnInit() {
    if (this.answerId) {
      this.requirements =
        this.storage.getDetailedRequirementsOfAnswer(this.answerId) || []
    }
  }

  createRequirement(type: 'stat' | 'condition') {
    const id = 'requirement_' + this.storage.getNewIdForRequirement()
    const amount = 1
    const name = 'New ' + type
    this.requirements.push({
      id,
      name,
      amount,
      type,
    })

    this.storage.addRequirementToAnswer(this.answerId, {
      id,
      amount,
      type,
    })

    this.storage.saveRequirementDetails(id, {
      name,
    })
  }
  updateRequirementName(options: any) {
    const requirementId = options.id
    const name = options.value

    const requirement = this.requirements.find(
      (req) => req.id === requirementId
    )
    if (requirement) requirement.name = name

    this.storage.updateRequiremenDetail_Name(requirementId, name)
  }

  updateRequirementAmount(options: any) {
    const requirementId = options.id
    const amount = parseInt(options.value)

    const requirement = this.requirements.find(
      (req) => req.id === requirementId
    )
    if (requirement) requirement.amount = amount

    this.storage.updateRequirementAmount(this.answerId, requirementId, amount)
  }

  deleteRequirement(requirementId: string) {
    this.requirements = this.requirements.filter((requirement: any) => {
      return requirement.id !== requirementId
    })

    this.storage.deleteRequirementFromAnswer(this.answerId, requirementId)
  }

  closeManager() {
    this.onClose.emit()
  }
}
