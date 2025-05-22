import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { PopupBaseComponent } from '../popup-base/popup-base.component'

@Component({
  selector: 'polo-select-or-create',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent],
  templateUrl: './select-or-create.component.html',
  styleUrl: './select-or-create.component.sass',
})
export class SelectOrCreateComponent extends PopupBaseComponent {
  @Input() options: Array<any> = []
  @Input() message?: string
  @Input() selectedOption?: string
  @Output() onNewOption: EventEmitter<any> = new EventEmitter()
  @Output() onSelectOption: EventEmitter<any> = new EventEmitter()
  @ViewChild('search') search?: ElementRef

  searchedOptions: Array<any> = []
  newOption?: string
  optionsOpened: boolean = false

  ngOnInit(): void {
    setTimeout(() => {
      this.search?.nativeElement.focus()
    })
    this.searchedOptions = this.options
  }

  selectOption(option: any) {
    const previousValue = this.selectedOption
    this.selectedOption = option
    this.onSelectOption.emit({
      value: option.id,
      previousValue: previousValue,
    })
  }

  createOption(newOption: string) {
    this.onNewOption.emit(newOption)
  }

  filterOptions(event: any) {
    const value = event.target.value

    this.searchedOptions = this.options.filter((option) =>
      option.name.toLowerCase().includes(value.toLowerCase())
    )

    this.newOption = this.searchedOptions[0]?.name != value ? value : undefined
  }
}
