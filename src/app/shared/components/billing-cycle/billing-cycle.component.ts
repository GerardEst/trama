import { Component, Output, EventEmitter, Input } from '@angular/core'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-billing-cycle',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './billing-cycle.component.html',
  styleUrl: './billing-cycle.component.css',
})
export class BillingCycleComponent {
  @Output() onChangePayingPeriod: EventEmitter<string> = new EventEmitter()
  period: string = 'monthly'
  @Input() small: boolean = false

  changePayingPeriod(period: string) {
    this.period = period
    this.onChangePayingPeriod.emit(period)
  }
}
