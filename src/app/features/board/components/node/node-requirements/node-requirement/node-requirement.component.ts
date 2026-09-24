import { Component, Output, Input, EventEmitter } from '@angular/core'
import { NodeAddRequirementComponent } from '../../context-menus/node-add-requirement/node-add-requirement.component'

@Component({
  selector: 'polo-node-requirement',
  standalone: true,
  imports: [NodeAddRequirementComponent],
  templateUrl: './node-requirement.component.html',
  styleUrl: './node-requirement.component.sass',
})
export class NodeRequirementComponent {
  @Output() onSaveRequirement: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteRequirement: EventEmitter<any> = new EventEmitter()

  @Input() type: 'stat' | 'condition' = 'stat'
  @Input() amount!: string
  @Input() target!: string

  openModifyRequirement: boolean = false

  get displayTarget() {
    return (this.target || '')
      .replace(/^(stat|condition|property)_/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/^\w/, (letter) => letter.toUpperCase())
  }

  get displayValue() {
    if (this.type === 'condition') {
      return Number(this.amount) ? 'Required' : 'Must be off'
    }

    return `≥ ${this.amount}`
  }

  saveRequirement(event: any) {
    this.onSaveRequirement.emit({
      ...event,
      previousValue: this.target,
    })
  }

  deleteRequirement(event: any) {
    this.onDeleteRequirement.emit(event.target)
  }
}
