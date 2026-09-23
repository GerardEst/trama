import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core'
import { SelectOrCreateComponent } from 'src/app/shared/components/ui/select-or-create/select-or-create.component'
import { StoryReferencesService } from '../../../../services/story-references.service'

@Component({
  selector: 'polo-node-add-modify-ref',
  standalone: true,
  imports: [SelectOrCreateComponent],
  templateUrl: './node-add-modify-ref.component.html',
  styleUrl: './node-add-modify-ref.component.sass',
})
export class NodeAddModifyRefComponent implements OnChanges {
  // Els inputs per configurar l'event depenent de si és stat o condition

  @Output() onChangeTarget = new EventEmitter<{
    value: string
    previousValue?: string
  }>()
  @Output() onChangeAmount = new EventEmitter<{
    id?: string
    value: string | number
  }>()
  @Output() onChangeProperty = new EventEmitter<{ id?: string; value: string }>()

  @Input() id?: string
  @Input() amount?: string | number
  @Input() property?: string
  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() selectedOption?: string

  options: Array<{ id: string; name: string }> = []
  message?: string
  selectorOpen: boolean = false

  constructor(private storyReferences: StoryReferencesService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['type']) {
      this.options = this.storyReferences.getByType(this.type)
      this.message = `Choose or create a ${this.type}`
    }
  }

  get typeLabel() {
    return this.type.charAt(0).toUpperCase() + this.type.slice(1)
  }

  get selectedOptionName() {
    if (!this.selectedOption) return ''
    return (
      this.storyReferences.getName(this.selectedOption) || this.selectedOption
    )
  }

  get isConditionActive() {
    return Number(this.amount) === 1
  }

  get eventSummary() {
    const targetName = this.selectedOptionName
    if (!targetName) return ''

    if (this.type === 'condition') {
      return this.isConditionActive
        ? `Grant “${targetName}” to the player.`
        : `Remove “${targetName}” from the player.`
    }

    if (this.type === 'property') {
      return this.property
        ? `Set “${targetName}” to “${this.property}”.`
        : `Clear the value of “${targetName}”.`
    }

    if (this.amount === undefined || this.amount === '') {
      return `Enter how much “${targetName}” should change.`
    }

    const amount = Number(this.amount)
    if (amount === 0) return `Keep “${targetName}” unchanged.`

    return `${amount > 0 ? 'Increase' : 'Decrease'} “${targetName}” by ${Math.abs(amount)}.`
  }

  onNewOption(option: string) {
    const createdRef = this.storyReferences.create(option, this.type)
    if (createdRef) {
      const previousValue = this.selectedOption
      this.selectedOption = createdRef.id
      this.options = [...this.options, createdRef]
      this.onChangeTarget.emit({
        value: createdRef.id,
        previousValue,
      })
    }

    setTimeout(() => {
      this.selectorOpen = false
    }, 0)
  }

  onSelectOption(option: { value: string }) {
    const previousValue = this.selectedOption
    this.selectedOption = option.value
    this.onChangeTarget.emit({
      value: this.selectedOption,
      previousValue,
    })

    setTimeout(() => {
      this.selectorOpen = false
    }, 0)
  }

  changeAmount(event: Event) {
    const input = event.target as HTMLInputElement
    this.amount = input.value
    this.onChangeAmount.emit({ id: this.id, value: input.value })
  }

  changeCheckbox(event: Event) {
    const input = event.target as HTMLInputElement
    this.amount = Number(input.checked)
    this.onChangeAmount.emit({
      id: this.id,
      value: this.amount,
    })
  }

  changeProperty(event: Event) {
    const input = event.target as HTMLInputElement
    this.property = input.value
    this.onChangeProperty.emit({ id: this.id, value: input.value })
  }
}
