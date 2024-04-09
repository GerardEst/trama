import {
  Component,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { SelectorComponent } from '../ui/selector/selector.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { SelectOrCreateComponent } from 'src/app/context-menus/select-or-create/select-or-create.component'
import { ContextMenusService } from 'src/app/services/context-menus.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'

@Component({
  selector: 'polo-event',
  standalone: true,
  imports: [
    CommonModule,
    SelectorComponent,
    SelectOrCreateComponent,
    BasicButtonComponent,
  ],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.sass'],
})
export class EventComponent implements OnInit {
  @Output() onChangeElement: EventEmitter<any> = new EventEmitter()
  @Output() onChangeAmount: EventEmitter<any> = new EventEmitter()
  @Output() onDelete: EventEmitter<any> = new EventEmitter()
  @Input() id?: string
  @Input() amount?: number
  @Input() action?: 'alterStat' | 'alterCondition'
  infoData: any = {}
  infoMessage?: string
  @ViewChild('selector') selector?: any

  constructor(
    private activeStory: ActiveStoryService,
    private contextMenu: ContextMenusService
  ) {}

  ngOnInit() {
    this.infoData = {
      value: this.id ? this.activeStory.getRefName(this.id) : '',
      amount: this.amount,
    }
  }

  openSelectorFor(clickEvent: Event, refId: string | undefined) {
    const contextMenu = this.contextMenu.launch(
      SelectOrCreateComponent,
      clickEvent.target
    )

    contextMenu.setInput('options', this.getFormattedRefsOfTree())
    contextMenu.setInput(
      'message',
      `Select a ${this.getTypeForEvent()} or create new one`
    )
    contextMenu.setInput('selectedOption', refId)

    contextMenu.instance.onSelectOption.subscribe(
      (event: { value: string; previousValue: string }) => {
        // update the selected option
        contextMenu.setInput('selectedOption', event.value)

        // update the info message
        this.infoData.value = this.activeStory.getRefName(event.value)

        this.onChangeElement.emit(event)

        this.contextMenu.close()
      }
    )
    contextMenu.instance.onNewOption.subscribe((event: string) => {
      const type = this.getTypeForEvent()
      if (!type) {
        console.log('No action defined for this event')
        return
      }
      const createdRef = this.activeStory.createNewRef(event, type)
      if (createdRef) {
        this.infoData.value = this.activeStory.getRefName(createdRef.id)
        this.onChangeElement.emit({
          value: createdRef.id,
          previousValue: contextMenu.instance.selectedOption,
        })
      }

      this.contextMenu.close()
    })
  }

  changeAmount(event: any) {
    this.onChangeAmount.emit({ id: this.id, value: event.target.value })

    // Update the info message
    this.infoData.amount = event.target.value
  }

  changeCheckbox(event: any) {
    this.onChangeAmount.emit({
      id: this.id,
      value: Number(event.target.checked),
    })
    // Update the info message
    this.infoData.amount = event.target.value
  }

  removeEvent() {
    this.onDelete.emit(this.id)
  }

  getFormattedRefsOfTree() {
    if (!this.action) {
      console.log('No action defined for this event')
      return
    }
    const type = this.getTypeForEvent()

    if (!type) return []
    return this.activeStory.getRefsFormatted(type)
  }

  getTypeForEvent() {
    // Extract a type of the refs needed for this action
    return this.action === 'alterStat'
      ? 'stat'
      : this.action === 'alterCondition'
        ? 'condition'
        : undefined
  }

  getMathAbs(val: number) {
    return Math.abs(val)
  }
}
