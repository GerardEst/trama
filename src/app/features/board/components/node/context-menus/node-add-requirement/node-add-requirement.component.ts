import { Component, Output, EventEmitter, Input } from '@angular/core'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { NodeAddModifyRefComponent } from '../node-add-modify-ref/node-add-modify-ref.component'

@Component({
  selector: 'polo-node-add-requirement',
  standalone: true,
  imports: [NodeAddModifyRefComponent],
  templateUrl: './node-add-requirement.component.html',
  styleUrl: './node-add-requirement.component.sass',
})
export class NodeAddRequirementComponent extends PopupBaseComponent {
  @Output() onSaveRequirement: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteRequirement: EventEmitter<any> = new EventEmitter()

  @Input() canBeDeleted: boolean = false
  @Input() eventId: string = ''
  @Input() target: string = ''
  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() property?: string
  @Input() amount?: string

  onChangeTarget(event: any) {
    this.target = event.value
  }

  onChangeAmount(event: any) {
    this.amount = event.value
  }

  onChangeProperty(event: any) {
    this.property = event.value
  }

  saveRequirement() {
    this.onSaveRequirement.emit({
      target: this.target,
      amount: this.amount,
      type: this.type,
    })
    this.onClose.emit()
  }

  onCancel() {
    this.onClose.emit()
  }

  deleteRequirement() {
    this.onDeleteRequirement.emit({
      target: this.target,
      amount: this.amount,
      type: this.type,
    })
    this.onClose.emit()
  }
}
