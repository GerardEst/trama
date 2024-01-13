import { Component, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'polo-modal-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.sass'],
})
export class ModalWindowComponent {
  // @Output() onClose: EventEmitter<any> = new EventEmitter()
  // Right now, we don't allow to close the modal window
  // When needed, uncomment the following code but caution: there has to be the possibility to do blocking modals that don't allow closing
  // unless completed
  // closeModal() {
  //   this.onClose.emit()
  // }
}
