import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DropdownButtonsComponent } from '../ui/dropdown-button/dropdown-buttons.component'
import { RequirementComponent } from '../ui/requirement/requirement.component'
import { StorageService } from 'src/app/services/storage.service'

interface requirement {
  name: string
  amount: number
  type: 'object' | 'character' | 'condition'
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
  @Input() answerId?: string

  constructor(private storage: StorageService) {}

  ngOnInit() {
    if (this.answerId) {
      this.requirements =
        this.storage.getRequirementsOfAnswer(this.answerId) || []
    }
  }

  createObjectRequirement() {
    this.requirements.push({
      name: '',
      amount: 1,
      type: 'object',
    })
  }
  createCharacterRequirement() {
    this.requirements.push({
      name: '',
      amount: 1,
      type: 'character',
    })
  }
  createConditionRequirement() {
    this.requirements.push({
      name: '',
      amount: 1,
      type: 'condition',
    })
  }
  saveRequirement(event: any) {
    if (!this.answerId) return
    this.storage.addRequirement(this.answerId, {
      name: event.name,
      amount: event.amount,
      type: event.type,
    })
  }
}
