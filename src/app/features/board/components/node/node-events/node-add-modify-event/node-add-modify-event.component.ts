import { Component, EventEmitter, Input, Output } from '@angular/core'
import { SelectOrCreateComponent } from 'src/app/shared/components/ui/select-or-create/select-or-create.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

@Component({
  selector: 'polo-node-add-modify-event',
  standalone: true,
  imports: [SelectOrCreateComponent],
  templateUrl: './node-add-modify-event.component.html',
  styleUrl: './node-add-modify-event.component.sass',
})
export class NodeAddModifyEventComponent {
  @Output() onChangeElement: EventEmitter<any> = new EventEmitter()
  @Output() onChangeAmount: EventEmitter<any> = new EventEmitter()
  @Output() onDelete: EventEmitter<any> = new EventEmitter()

  @Input() id?: string
  @Input() amount?: number
  @Input() type: 'stat' | 'condition' = 'stat'

  options: any = []
  message?: string
  selectedOption?: string
  selectorOpen: boolean = false

  constructor(private activeStory: ActiveStoryService) {}

  ngOnInit() {
    this.options = this.activeStory.getRefsFormatted(this.type)

    this.message = `Select a ${this.type} or create new one`
  }

  onNewOption(option: any) {
    const createdRef = this.activeStory.createNewRef(option, this.type)
    if (createdRef) {
      this.onChangeElement.emit({
        value: createdRef.id,
        previousValue: this.selectedOption,
      })
    }

    setTimeout(() => {
      this.selectorOpen = false
    }, 0)
  }

  onSelectOption(option: any) {
    this.selectedOption = option.value
    this.onChangeElement.emit({
      value: option,
      previousValue: this.selectedOption,
    })

    setTimeout(() => {
      this.selectorOpen = false
    }, 0)
  }

  changeAmount(event: any) {
    const eventId = this.id
    const amount = parseInt(event.target.value)

    // const event = this.events.find((event) => event.target === eventId)
    // if (event) event.amount = amount

    // this.activeStory.saveAnswerEvents(this.answerId, this.events)

    // this.onChangeAmount.emit({ id: this.id, value: event.target.value })
  }

  changeCheckbox(event: any) {
    this.onChangeAmount.emit({
      id: this.id,
      value: Number(event.target.checked),
    })
  }
}
