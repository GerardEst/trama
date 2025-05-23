import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core'
import { NodeAddEventComponent } from '../../context-menus/node-add-event/node-add-event.component'

@Component({
  selector: 'polo-node-event',
  standalone: true,
  imports: [NodeAddEventComponent],
  templateUrl: './node-event.component.html',
  styleUrl: './node-event.component.sass',
})
export class NodeEventComponent {
  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteEvent: EventEmitter<any> = new EventEmitter()

  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() amount!: string
  @Input() target!: string
  @Input() property?: string

  isNegative: boolean = false
  openModifyEvent: boolean = false

  ngOnInit() {
    if (!this.amount) return
    this.isNegative = this.getIsNegative(this.amount)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['amount']) {
      this.isNegative = this.getIsNegative(this.amount)
    }
  }

  getIsNegative(amount: string | number) {
    if (typeof amount === 'string') {
      return amount.includes('-')
    }
    return amount <= 0
  }

  saveEvent(event: any) {
    this.onSaveEvent.emit(event)
  }

  deleteEvent(event: any) {
    this.onDeleteEvent.emit(event)
  }
}
