import { Component, Input } from '@angular/core'
import { AlertWindowComponent } from 'src/app/shared/components/ui/alert-window/alert-window.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { AlertService } from 'src/app/core/services/alert.service'

/**
 * Asks before something that cannot be easily undone. Launched with AlertService, it resolves
 * true only when the person picks the confirming button; the safe choice is the first one.
 */
@Component({
  selector: 'polo-confirm-dialog',
  standalone: true,
  imports: [AlertWindowComponent, BasicButtonComponent],
  template: `
    <polo-alert-window>
      <ng-container modal-content>
        <p class="title">{{ title }}</p>
        @if (message) {
          <p class="message">{{ message }}</p>
        }
      </ng-container>
      <ng-container modal-options>
        <polo-basic-button (click)="close()" [text]="cancelText"></polo-basic-button>
        <polo-basic-button (click)="confirm()" [text]="confirmText" [type]="danger ? 'danger' : 'primary'"></polo-basic-button>
      </ng-container>
    </polo-alert-window>
  `,
  styles: `
    .title {
      margin: 0;
      color: var(--polo-color-text-strong);
      font-weight: 700;
    }
    .message {
      margin: var(--polo-space-2) 0 0;
      color: var(--polo-color-text-secondary);
      line-height: 1.5;
    }
  `,
})
export class ConfirmDialogComponent {
  @Input({ required: true }) title = ''
  @Input() message = ''
  @Input({ required: true }) confirmText = ''
  @Input({ required: true }) cancelText = ''
  @Input() danger = false
  resolve: (value: boolean) => void = () => {}

  constructor(private alertService: AlertService) {}

  confirm() {
    this.resolve(true)
    this.alertService.close()
  }

  close() {
    this.resolve(false)
    this.alertService.close()
  }
}
