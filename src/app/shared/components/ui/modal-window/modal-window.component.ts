import { Component, Output, EventEmitter, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ModalService } from 'src/app/core/services/modal.service'
import { BasicButtonComponent } from '../basic-button/basic-button.component'
import { animate, style, transition, trigger } from '@angular/animations'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-modal-window',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent, TranslatePipe],
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.css'],
  animations: [
    trigger('toggleModal', [
      transition(':enter', [
        style({ opacity: 0, ['margin-top']: '20px' }),
        animate('200ms', style({ opacity: 1, ['margin-top']: '0' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, ['margin-top']: '0' }),
        animate('100ms', style({ opacity: 0, ['margin-top']: '20px' })),
      ]),
    ]),
    trigger('toggleModalBackground', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('100ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ModalWindowComponent {
  @Input() name?: string
  @Input() mode?: 'dialog'

  isOpen: boolean = true

  constructor(private modalService: ModalService) {}

  close() {
    this.isOpen = false
    setTimeout(() => {
      this.modalService.close()
    }, 300)
  }
}
