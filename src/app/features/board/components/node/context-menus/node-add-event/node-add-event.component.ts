import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core'
import { ChoiceCardComponent } from 'src/app/shared/components/ui/choice-card/choice-card.component'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { NodeAddModifyRefComponent } from '../node-add-modify-ref/node-add-modify-ref.component'

@Component({
  selector: 'polo-node-add-event',
  standalone: true,
  imports: [ChoiceCardComponent, NodeAddModifyRefComponent],
  templateUrl: './node-add-event.component.html',
  styleUrl: './node-add-event.component.sass',
})
export class NodeAddEventComponent
  extends PopupBaseComponent
  implements AfterViewInit
{
  // El popup per configurar l'event
  // S'obre al crear i modificar events

  @Output() onSaveEvent: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteEvent: EventEmitter<any> = new EventEmitter()

  @Input() canBeDeleted: boolean = false
  @Input() eventId: string = ''
  @Input() target: string = ''
  @Input() type: 'stat' | 'condition' | 'property' = 'stat'
  @Input() property?: string
  @Input() amount?: string | number

  @ViewChildren('typeOption', { read: ElementRef }) typeOptions?: QueryList<
    ElementRef<HTMLElement>
  >

  confirmingDelete = false

  get canSave() {
    if (!this.target) return false
    if (this.type !== 'stat') return true

    return (
      this.amount !== undefined &&
      this.amount !== '' &&
      Number.isFinite(Number(this.amount))
    )
  }

  ngAfterViewInit() {
    const selectedTypeIndex = ['stat', 'condition', 'property'].indexOf(
      this.type
    )
    setTimeout(() =>
      this.typeOptions
        ?.get(selectedTypeIndex)
        ?.nativeElement.querySelector('button')
        ?.focus()
    )
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.confirmingDelete) {
      this.confirmingDelete = false
      return
    }

    this.onCancel()
  }

  selectType(type: 'stat' | 'condition' | 'property') {
    if (type === this.type) return

    this.type = type
    this.target = ''
    this.amount = type === 'condition' ? 0 : undefined
    this.property = undefined
    this.confirmingDelete = false
  }

  onChangeTarget(event: { value: string }) {
    this.target = event.value
  }

  onChangeAmount(event: { value: string | number }) {
    this.amount = event.value
  }

  onChangeProperty(event: { value: string }) {
    this.property = event.value
  }

  saveEvent() {
    if (!this.canSave) return

    this.onSaveEvent.emit({
      target: this.target,
      amount: this.amount,
      type: this.type,
      property: this.property,
    })
    this.onClose.emit()
  }

  requestDelete() {
    this.confirmingDelete = true
  }

  onCancel() {
    this.onClose.emit()
  }

  deleteEvent() {
    this.onDeleteEvent.emit({
      target: this.target,
      amount: this.amount,
      type: this.type,
      property: this.property,
    })
    this.onClose.emit()
  }
}
