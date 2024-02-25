import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContextMenusService } from 'src/app/services/context-menus.service'

@Component({
  selector: 'polo-select-or-create',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-or-create.component.html',
  styleUrl: './select-or-create.component.sass',
  // host: {
  //   '(document:click)': 'onClickOutside($event)',
  // },
})
export class SelectOrCreateComponent {
  @Input() options: Array<any> = []
  @Input() message?: string
  @Output() onNewOption: EventEmitter<any> = new EventEmitter()
  @Output() onSelectOption: EventEmitter<any> = new EventEmitter()
  @ViewChild('search') search?: ElementRef

  searchedOptions: Array<any> = []
  selectedOption?: any
  newOption?: string
  optionsOpened: boolean = false

  constructor() // private elementRef: ElementRef,
  // private contextMenu: ContextMenusService
  {}

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
      previousValue: previousValue?.id,
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

  // onClickOutside(event: MouseEvent): void {
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     this.contextMenu.close()
  //   }
  // }
}
