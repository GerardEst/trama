import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core'
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
  // Els inputs per configurar l'event depenent de si és stat o condition

  @Output() onChangeTarget: EventEmitter<any> = new EventEmitter()
  @Output() onChangeAmount: EventEmitter<any> = new EventEmitter()

  @Input() id?: string
  @Input() amount?: string
  @Input() type: 'stat' | 'condition' = 'stat'
  @Input() selectedOption?: string

  options: any = []
  message?: string
  selectorOpen: boolean = false

  constructor(private activeStory: ActiveStoryService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['type']) {
      this.options = this.activeStory.getRefsFormatted(this.type)
      this.message = `Select a ${this.type} or create new one`
    }
  }

  onNewOption(option: any) {
    const createdRef = this.activeStory.createNewRef(option, this.type)
    if (createdRef) {
      this.onChangeTarget.emit({
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
    this.onChangeTarget.emit({
      value: this.selectedOption,
      previousValue: this.selectedOption,
    })

    setTimeout(() => {
      this.selectorOpen = false
    }, 0)
  }

  changeAmount(event: any) {
    this.onChangeAmount.emit({ id: this.id, value: event.target.value })
  }

  changeCheckbox(event: any) {
    this.onChangeAmount.emit({
      id: this.id,
      value: Number(event.target.checked),
    })
  }
}
