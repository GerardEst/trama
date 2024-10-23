import { Component, Output, EventEmitter, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ModalService } from 'src/app/services/modal.service'
import { BasicButtonComponent } from '../basic-button/basic-button.component'

@Component({
  selector: 'polo-modal-window',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent],
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.sass'],
})
export class ModalWindowComponent {
  @Input() name?: string
  @Input() mode?: 'dialog'

  constructor(private modalService: ModalService) {}

  close() {
    this.modalService.close()
  }
}
