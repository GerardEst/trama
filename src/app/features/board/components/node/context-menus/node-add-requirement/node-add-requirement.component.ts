import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core'
import { ChoiceCardComponent } from 'src/app/shared/components/ui/choice-card/choice-card.component'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { NodeAddModifyRefComponent } from '../node-add-modify-ref/node-add-modify-ref.component'

@Component({
  selector: 'polo-node-add-requirement',
  standalone: true,
  imports: [ChoiceCardComponent, NodeAddModifyRefComponent],
  templateUrl: './node-add-requirement.component.html',
  styleUrl: './node-add-requirement.component.sass',
})
export class NodeAddRequirementComponent extends PopupBaseComponent {
  @Output() onSaveRequirement = new EventEmitter<{
    target: string
    amount: string | number
    type: 'stat' | 'condition'
  }>()
  @Output() onDeleteRequirement = new EventEmitter<{
    target: string
    amount: string | number
    type: 'stat' | 'condition'
  }>()

  @Input() canBeDeleted: boolean = false
  @Input() eventId: string = ''
  @Input() target: string = ''
  @Input() originalTarget?: string
  @Input() type: 'stat' | 'condition' = 'stat'
  @Input() property?: string
  @Input() amount?: string | number

  confirmingDelete = false

  get canSave() {
    if (!this.target) return false
    if (this.type === 'condition') return true

    return (
      this.amount !== undefined &&
      this.amount !== '' &&
      Number.isFinite(Number(this.amount))
    )
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.confirmingDelete) {
      this.confirmingDelete = false
      return
    }

    this.onCancel()
  }

  selectType(type: 'stat' | 'condition') {
    if (type === this.type) return

    this.type = type
    this.target = ''
    this.amount = type === 'condition' ? 1 : undefined
    this.confirmingDelete = false
  }

  onChangeTarget(event: { value: string }) {
    this.target = event.value
  }

  onChangeAmount(event: { value: string | number }) {
    this.amount = event.value
  }

  saveRequirement() {
    if (!this.canSave) return

    this.onSaveRequirement.emit({
      target: this.target,
      amount: this.amount ?? 0,
      type: this.type,
    })
    this.onClose.emit()
  }

  onCancel() {
    this.onClose.emit()
  }

  deleteRequirement() {
    this.onDeleteRequirement.emit({
      target: this.originalTarget ?? this.target,
      amount: this.amount ?? 0,
      type: this.type,
    })
    this.onClose.emit()
  }
}
