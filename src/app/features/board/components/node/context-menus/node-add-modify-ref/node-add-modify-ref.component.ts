import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core'
import { FormFieldComponent } from 'src/app/shared/components/ui/form-field/form-field.component'
import { SelectorComponent } from 'src/app/shared/components/ui/selector/selector.component'
import { StoryReferencesService } from '../../../../services/story-references.service'

let nextReferenceEditorId = 0

@Component({
  selector: 'polo-node-add-modify-ref',
  standalone: true,
  imports: [FormFieldComponent, SelectorComponent],
  templateUrl: './node-add-modify-ref.component.html',
  styleUrl: './node-add-modify-ref.component.sass',
})
export class NodeAddModifyRefComponent implements OnChanges {
  readonly controlIdPrefix = `reference-editor-${nextReferenceEditorId++}`

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
  @Input() mode: 'event' | 'requirement' = 'event'
  @Input() selectedOption?: string

  options: Array<{ id: string; name: string }> = []
  message?: string

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

    if (this.mode === 'requirement') {
      if (this.type === 'condition') {
        return this.isConditionActive
          ? `Show this answer when “${targetName}” is active.`
          : `Show this answer when “${targetName}” is inactive.`
      }

      if (this.amount === undefined || this.amount === '') {
        return `Enter the minimum value for “${targetName}”.`
      }

      return `Show this answer when “${targetName}” is at least ${this.amount}.`
    }

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
  }

  onSelectOption(option: { value: string }) {
    const previousValue = this.selectedOption
    this.selectedOption = option.value
    this.onChangeTarget.emit({
      value: this.selectedOption,
      previousValue,
    })
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
