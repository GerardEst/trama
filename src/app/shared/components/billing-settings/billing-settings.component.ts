import { Component, Input } from '@angular/core'
import { PricingComponent } from 'src/app/shared/components/pricing/pricing.component'
import { BillingCycleComponent } from 'src/app/shared/components/billing-cycle/billing-cycle.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'

/** The author's plan and subscription: what they have first, then the plans they can take. */
@Component({
  selector: 'polo-billing-settings',
  standalone: true,
  imports: [PricingComponent, BillingCycleComponent, TranslatePipe],
  templateUrl: './billing-settings.component.html',
  styleUrl: './billing-settings.component.css',
})
export class BillingSettingsComponent {
  /** The dashboard titles the page itself, the modal needs its own heading. */
  @Input() heading = true
  payAnnually: boolean = false

  constructor(
    public db: DatabaseService,
    private i18n: I18nService
  ) {}

  status(): string {
    return this.db.user()?.profile?.subscription_status ?? ''
  }

  planName(): TranslationKey {
    const plan = this.db.user()?.profile?.plan ?? ''
    if (plan.includes('creator')) return 'settings.billing.creator'
    if (plan.includes('pro')) return 'settings.billing.legacyPro'
    return 'settings.billing.none'
  }

  /** The billing period only matters to someone about to subscribe. */
  canChoosePlan(): boolean {
    return this.status() !== 'active' || this.planName() === 'settings.billing.none'
  }

  paymentDate(date: string) {
    return this.i18n.formatDate(date, { dateStyle: 'long' })
  }

  /** A canceled plan lasts until the end of the period already paid. */
  canceledPlanEnd(nextPayment?: string | null) {
    return nextPayment && new Date(nextPayment).getTime() > Date.now() ? this.paymentDate(nextPayment) : null
  }
}
