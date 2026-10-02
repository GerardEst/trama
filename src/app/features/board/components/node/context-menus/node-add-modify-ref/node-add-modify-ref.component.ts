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
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslationKey, TranslationParams } from 'src/app/core/i18n/i18n.types'

@Component({
  selector: 'polo-node-add-modify-ref',
  standalone: true,
  imports: [FormFieldComponent, SelectorComponent, TranslatePipe],
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

  constructor(
    private storyReferences: StoryReferencesService,
    private i18n: I18nService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['type']) {
      this.options = this.storyReferences.getByType(this.type)
    }
  }

  get message() {
    return this.i18n.t(`board.reference.choose.${this.type}`)
  }

  get typeLabel() {
    return this.i18n.t(`board.reference.types.${this.type}`)
  }

  get referenceHelp() {
    const mode = this.i18n.t(`board.reference.modes.${this.mode}`)
    return this.i18n.t(`board.reference.help.${this.type}`, { mode })
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
    const name = this.selectedOptionName
    if (!name) return ''
    const t = (key: TranslationKey, params: TranslationParams = {}) =>
      this.i18n.t(key, { name, ...params })

    if (this.mode === 'requirement') {
      if (this.type === 'condition') {
        return this.isConditionActive
          ? t('board.reference.summary.showWhenActive')
          : t('board.reference.summary.showWhenInactive')
      }

      if (this.amount === undefined || this.amount === '') {
        return t('board.reference.summary.enterMinimum')
      }

      return t('board.reference.summary.showWhenAtLeast', { amount: this.amount })
    }

    if (this.type === 'condition') {
      return this.isConditionActive
        ? t('board.reference.summary.grant')
        : t('board.reference.summary.remove')
    }

    if (this.type === 'property') {
      return this.property
        ? t('board.reference.summary.set', { value: this.property })
        : t('board.reference.summary.clear')
    }

    if (this.amount === undefined || this.amount === '') {
      return t('board.reference.summary.enterChange')
    }

    const amount = Number(this.amount)
    if (amount === 0) return t('board.reference.summary.keep')

    return t(amount > 0 ? 'board.reference.summary.increase' : 'board.reference.summary.decrease', {
      amount: Math.abs(amount),
    })
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
