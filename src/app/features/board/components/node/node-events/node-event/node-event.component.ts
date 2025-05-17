import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core'
import { event } from 'src/app/core/interfaces/interfaces'
import { NodeAddEventComponent } from '../../context-menus/node-add-event/node-add-event.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
@Component({
  selector: 'polo-node-event',
  standalone: true,
  imports: [NodeAddEventComponent],
  templateUrl: './node-event.component.html',
  styleUrl: './node-event.component.sass',
})
export class NodeEventComponent {
  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()
  @Input() type: 'stat' | 'condition' = 'stat'
  @Input() amount!: string
  @Input() target!: string

  isNegative: boolean = false
  openModifyEvent: boolean = false

  constructor(private activeStory: ActiveStoryService) {}

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
}
