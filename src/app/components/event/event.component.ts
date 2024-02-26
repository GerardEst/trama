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
import { StorageService } from 'src/app/services/storage.service'
import { SelectOrCreateComponent } from 'src/app/context-menus/select-or-create/select-or-create.component'
import { ContextMenusService } from 'src/app/services/context-menus.service'

@Component({
  selector: 'polo-event',
  standalone: true,
  imports: [CommonModule, SelectorComponent, SelectOrCreateComponent],
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
    private storage: StorageService,
    private contextMenu: ContextMenusService
  ) {}

  ngOnInit() {
    this.infoData = {
      value: this.id ? this.storage.getRefName(this.id) : '',
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
        this.infoData.value = this.storage.getRefName(event.value)

        this.onChangeElement.emit(event)

        this.contextMenu.close()
      }
    )
    contextMenu.instance.onNewOption.subscribe((event: string) => {
      const type = this.getTypeForEvent()
      if (!type) {
        console.warn('No action defined for this event')
        return
      }
      const createdRef = this.storage.createNewRef(event, type)
      if (createdRef) {
        if (this.selector) {
          this.selector.selectOption({
            id: createdRef.id,
            name: createdRef.name,
          })
        }
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
      console.warn('No action defined for this event')
      return
    }
    const type = this.getTypeForEvent()

    if (!type) return []
    return this.storage.getRefsFormatted(type)
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
