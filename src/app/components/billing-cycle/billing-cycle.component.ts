import { Component, Output, EventEmitter, Input } from '@angular/core'

@Component({
  selector: 'polo-billing-cycle',
  standalone: true,
  imports: [],
  templateUrl: './billing-cycle.component.html',
  styleUrl: './billing-cycle.component.sass',
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
