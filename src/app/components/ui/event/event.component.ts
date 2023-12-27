import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'polo-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.sass'],
})
export class EventComponent {
  @ViewChild('target') targetInput?: ElementRef
  @ViewChild('amount') amountInput?: ElementRef
  @Output() updateTarget: EventEmitter<any> = new EventEmitter()
  @Output() updateAmount: EventEmitter<any> = new EventEmitter()
  @Output() deleted: EventEmitter<any> = new EventEmitter()
  @Input() id?: string
  @Input() ref?: string
  @Input() target?: string
  @Input() amount?: number

  changeTarget(event: any) {
    //this.updateTarget.emit({ id: this.id, value: event.target.value })
  }

  changeAmount(event: any) {
    //this.updateAmount.emit({ id: this.id, value: event.target.value })
  }

  removeEvent() {
    this.deleted.emit(this.id)
  }
}
