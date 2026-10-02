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
import { StoryReferencesService } from 'src/app/features/board/services/story-references.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'

@Component({
  selector: 'polo-node-event',
  standalone: true,
  imports: [AnchoredPopoverComponent, AnchoredPopoverContentDirective, NodeAddEventComponent, TranslatePipe],
  templateUrl: './node-event.component.html',
  styleUrl: './node-event.component.sass',
})
export class NodeEventComponent implements OnInit, OnChanges {
  constructor(
    private storyReferences: StoryReferencesService,
    private i18n: I18nService
  ) {}

  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteEvent: EventEmitter<any> = new EventEmitter()

  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() amount!: string
  @Input() target!: string
  @Input() property?: string

  isNegative: boolean = false

  get displayTarget() {
    const referenceName = this.storyReferences.getName(this.target)
    if (referenceName) return referenceName

    return (this.target || '')
      .replace(/^(stat|condition|property)_/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/^\w/, (letter) => letter.toUpperCase())
  }

  get displayValue() {
    if (this.type === 'condition') {
      return this.i18n.t(Number(this.amount) ? 'board.event.on' : 'board.event.off')
    }
    if (this.type === 'property') return this.property || this.i18n.t('board.event.cleared')

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
