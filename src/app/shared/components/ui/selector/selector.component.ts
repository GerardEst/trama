import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core'
import { SelectOrCreateComponent } from '../select-or-create/select-or-create.component'

let nextSelectorId = 0

export interface SelectorOption {
  id: string
  name: string
}

@Component({
  selector: 'polo-selector',
  standalone: true,
  imports: [SelectOrCreateComponent],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorComponent {
  @Input() options: SelectorOption[] = []
  @Input() selected?: string
  @Input() message?: string
  @Input() placeholder: string = 'Choose an option'
  @Input() controlId: string = `polo-selector-${nextSelectorId++}`
  @Input() describedBy?: string
  @Input() required: boolean = false
  @Input() disabled: boolean = false

  @Output() optionCreated = new EventEmitter<string>()
  @Output() selectionChanged = new EventEmitter<{
    value: string
    previousValue?: string
  }>()

  optionsOpened: boolean = false

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get selectedOptionName() {
    return this.options.find((option) => option.id === this.selected)?.name ?? ''
  }

  toggleOptions() {
    if (this.disabled) return
    this.optionsOpened = !this.optionsOpened
  }

  createOption(option: string) {
    this.optionCreated.emit(option)
    this.closeOptions()
  }

  selectOption(selection: { value: string; previousValue?: string }) {
    this.selected = selection.value
    this.selectionChanged.emit(selection)
    this.closeOptions()
  }

  closeOptions() {
    this.optionsOpened = false
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeOptions()
    }
  }
}
