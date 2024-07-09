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
  @Input() mode?: 'centered' | 'side' = 'centered'
  @Input() hide?: boolean = false
  @Input() locked?: boolean = false

  constructor(private modalService: ModalService) {}

  close() {
    if (this.locked) return

    this.modalService.close()
  }
}
