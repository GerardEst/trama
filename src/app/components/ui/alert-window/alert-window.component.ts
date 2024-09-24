import { Component, Output, EventEmitter, Input } from '@angular/core'
import { AlertService } from 'src/app/services/alert.service'
import { BasicButtonComponent } from '../basic-button/basic-button.component'

@Component({
  selector: 'polo-alert-window',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './alert-window.component.html',
  styleUrl: './alert-window.component.sass',
})
export class AlertWindowComponent {
  constructor(private alertService: AlertService) {}
}
