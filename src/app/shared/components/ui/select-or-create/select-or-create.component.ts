import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core'
import { PopupBaseComponent } from '../popup-base/popup-base.component'

@Component({
  selector: 'polo-select-or-create',
  standalone: true,
  imports: [],
  templateUrl: './select-or-create.component.html',
  styleUrl: './select-or-create.component.sass',
})
export class SelectOrCreateComponent
  extends PopupBaseComponent
  implements OnInit
{
  @Input() options: Array<{ id: string; name: string }> = []
  @Input() message?: string
  @Input() selectedOption?: string
  @Output() onNewOption = new EventEmitter<string>()
  @Output() onSelectOption = new EventEmitter<{
    value: string
    previousValue?: string
  }>()
  @ViewChild('search') search?: ElementRef

  searchedOptions: Array<{ id: string; name: string }> = []
  newOption?: string

  ngOnInit(): void {
    setTimeout(() => {
      this.search?.nativeElement.focus()
    })
    this.searchedOptions = this.options
  }

  selectOption(option: { id: string; name: string }) {
    const previousValue = this.selectedOption
    this.selectedOption = option.id
    this.onSelectOption.emit({
      value: option.id,
      previousValue: previousValue,
    })
  }

  createOption(newOption: string | undefined) {
    const trimmedOption = newOption?.trim()
    if (!trimmedOption) return

    this.onNewOption.emit(trimmedOption)
  }

  filterOptions(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim()
    const normalizedValue = value.toLowerCase()

    this.searchedOptions = this.options.filter((option) =>
      option.name.toLowerCase().includes(normalizedValue)
    )

    const exactMatch = this.options.some(
      (option) => option.name.toLowerCase() === normalizedValue
    )
    this.newOption = value && !exactMatch ? value : undefined
  }

  submitSearch() {
    if (this.newOption) {
      this.createOption(this.newOption)
      return
    }

    const firstOption = this.searchedOptions[0]
    if (firstOption) this.selectOption(firstOption)
  }
}
