import { Component, Output, EventEmitter, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'polo-modal-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.sass'],
})
export class ModalWindowComponent {
  @Output() onClose: EventEmitter<any> = new EventEmitter()
  @Input() title?: string
  @Input() locked?: boolean = false

  closeModal() {
    if (this.locked) return

    this.onClose.emit()
  }
}
