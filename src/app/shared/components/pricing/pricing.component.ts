import { Component, Input } from '@angular/core'
import { LandingLinkComponent } from '../link/landing-link.component'
import { PRICING } from 'src/app/core/constants'
import { Router } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'
import { CREATOR_CHECKOUT_OPEN, CheckoutService, CreatorBillingPeriod } from 'src/app/core/services/checkout.service'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { AlertService } from 'src/app/core/services/alert.service'
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'

@Component({
  selector: 'polo-pricing',
  standalone: true,
  imports: [LandingLinkComponent, BasicButtonComponent, TranslatePipe],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  pricing = PRICING
  readonly creatorCheckoutOpen = CREATOR_CHECKOUT_OPEN
  readonly creatorFeatures: TranslationKey[] = [
    'pricing.creator.stories', 'pricing.creator.images', 'pricing.creator.brand',
    'pricing.creator.sharing', 'pricing.creator.analytics', 'pricing.creator.data',
  ]

  @Input({ transform: checkPlan }) userPlan?: string | undefined
  @Input() canceledSubscription: boolean = false
  @Input() payAnnually: boolean = false
  @Input() email?: string
  @Input() preventEasyDowngrading: boolean = false
  @Input() dashed: boolean = false
  @Input() compactFeatures: boolean = false

  cancelingSubscription: boolean = false
  cancelFailed = false

  constructor(
    private router: Router,
    public db: DatabaseService,
    private i18n: I18nService,
    private checkout: CheckoutService,
    private alert: AlertService
  ) {}

  price(value: number) {
    return this.i18n.formatNumber(value, { minimumFractionDigits: 2 })
  }

  /** Someone still paying for Creator, from before it was free. */
  get paysForCreator() {
    return this.userPlan === 'creator' && !this.canceledSubscription
  }

  /** While Creator is free, it is the plan of everyone who has no other live plan. */
  get hasCreator() {
    return this.userPlan === 'creator' || (!this.creatorCheckoutOpen && (this.userPlan !== 'legacy-pro' || this.canceledSubscription))
  }

  get indicativeProPrice() {
    return this.i18n.formatNumber(PRICING.PRO_INDICATIVE_PRICE)
  }

  subscribe(plan: 'creator', isYearlyPlan: boolean) {
    if (plan !== 'creator') return
    if (this.email) {
      this.upgradePlan(plan, isYearlyPlan ? 'yearly' : 'monthly', this.email)
    } else {
      this.router.navigate(['/login'], {
        queryParams: {
          mode: 'register',
          plan,
          period: isYearlyPlan ? 'yearly' : 'monthly',
        },
      })
    }
  }

  upgradePlan(
    plan: 'creator',
    period: CreatorBillingPeriod,
    email: string
  ) {
    return this.checkout.start(plan, period, email)
  }

  /** Cancelling is asked first: it ends the plan the person pays for. Failures are said in place. */
  async cancelSubscription() {
    this.cancelFailed = false
    const confirmed = await this.alert.launch(ConfirmDialogComponent, {
      title: this.i18n.t('pricing.cancelConfirm'),
      message: this.i18n.t('pricing.cancelConfirmText'),
      confirmText: this.i18n.t('pricing.cancel'),
      cancelText: this.i18n.t('pricing.keep'),
      danger: true,
    })
    if (!confirmed) return
    this.cancelingSubscription = true
    this.cancelFailed = !(await this.db.cancelSubscription())
    this.cancelingSubscription = false
  }
}

function checkPlan(value: string | undefined) {
  if (!value) return
  if (value.includes('creator')) return 'creator'
  if (value.includes('pro')) return 'legacy-pro'
  return undefined
}
