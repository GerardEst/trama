import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnInit,
  OnChanges,
} from '@angular/core'
import { NodeAddEventComponent } from '../../context-menus/node-add-event/node-add-event.component'
import { AnchoredPopoverComponent } from 'src/app/shared/components/ui/anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from 'src/app/shared/components/ui/anchored-popover/anchored-popover-content.directive'

@Component({
  selector: 'polo-node-event',
  standalone: true,
  imports: [AnchoredPopoverComponent, AnchoredPopoverContentDirective, NodeAddEventComponent],
  templateUrl: './node-event.component.html',
  styleUrl: './node-event.component.sass',
})
export class NodeEventComponent implements OnInit, OnChanges {
  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteEvent: EventEmitter<any> = new EventEmitter()

  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() amount!: string
  @Input() target!: string
  @Input() property?: string

  isNegative: boolean = false

  get displayTarget() {
    return (this.target || '')
      .replace(/^(stat|condition|property)_/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/^\w/, (letter) => letter.toUpperCase())
  }

  get displayValue() {
    if (this.type === 'condition') return Number(this.amount) ? 'On' : 'Off'
    if (this.type === 'property') return this.property || 'Cleared'

    const numericAmount = Number(this.amount)
    return numericAmount > 0 ? `+${this.amount}` : `${this.amount}`
  }

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
