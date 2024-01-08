import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { option } from 'src/app/interfaces'

@Component({
  selector: 'polo-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.sass'],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
})
export class SelectorComponent implements OnInit {
  @Input() options: Array<option> = []
  @Input() selected?: string
  @Input() message?: string
  @Output() onNewOption: EventEmitter<any> = new EventEmitter()
  @Output() onSelectOption: EventEmitter<any> = new EventEmitter()
  @ViewChild('search') search?: ElementRef

  searchedOptions: Array<option> = []
  selectedOption?: option
  newOption?: string
  optionsOpened: boolean = false

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.searchedOptions = this.options

    // If we receive a selected option id, we start with it selected
    if (this.selected) {
      this.selectedOption = this.options.find((option: any) => {
        return option.id === this.selected
      })
    }
  }

  selectOption(option: option) {
    const previousValue = this.selectedOption
    this.selectedOption = option
    this.onSelectOption.emit({
      value: option.id,
      previousValue: previousValue?.id,
    })

    this.closeOptions()
  }

  createOption(newOption: string) {
    this.onNewOption.emit(newOption)

    this.closeOptions()
  }

  filterOptions(event: any) {
    const value = event.target.value

    this.searchedOptions = this.options.filter((option) =>
      option.name.toLowerCase().includes(value.toLowerCase())
    )

    this.newOption = this.searchedOptions[0]?.name != value ? value : undefined
  }

  toggleOptions() {
    if (this.optionsOpened) {
      this.closeOptions()
    } else {
      this.optionsOpened = true
      setTimeout(() => {
        this.search?.nativeElement.focus()
      }, 0)
    }
  }

  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeOptions()
    }
  }

  closeOptions() {
    this.optionsOpened = false
    this.searchedOptions = this.options
    this.newOption = undefined
  }
}
