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

  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() amount!: string
  @Input() target!: string
  @Input() property?: string

  openModifyRequirement: boolean = false

  saveRequirement(event: any) {
    console.log('Saving requirement:', event)
    this.onSaveRequirement.emit(event)
  }

  deleteRequirement(event: any) {
    console.log('Deleting requirement:', event)
    this.onDeleteRequirement.emit(event.target)
  }
}
