import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { SelectorComponent } from '../ui/selector/selector.component'
import { StorageService } from 'src/app/services/storage.service'

@Component({
  selector: 'polo-event',
  standalone: true,
  imports: [CommonModule, SelectorComponent],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.sass'],
})
export class EventComponent {
  @Output() onChangeElement: EventEmitter<any> = new EventEmitter()
  @Output() onChangeAmount: EventEmitter<any> = new EventEmitter()
  @Output() onDelete: EventEmitter<any> = new EventEmitter()
  @Input() id?: string
  @Input() amount?: number
  @Input() action?: 'alterStat' | 'alterCondition' | 'win' | 'end'
  type?: 'stat' | 'condition'
  @ViewChild('selector') selector?: any

  constructor(private storage: StorageService) {}

  changeElement(options: any) {
    this.onChangeElement.emit(options)
  }

  changeAmount(event: any) {
    this.onChangeAmount.emit({ id: this.id, value: event.target.value })
  }

  newOption(value: string) {
    const type = this.getTypeForEvent()
    if (!type) {
      console.warn('No action defined for this event')
      return
    }
    const createdRef = this.storage.createNewRef(value, type)
    if (createdRef) {
      if (this.selector) {
        this.selector.selectOption({
          id: createdRef.id,
          name: createdRef.name,
        })
      }
    }
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
}
