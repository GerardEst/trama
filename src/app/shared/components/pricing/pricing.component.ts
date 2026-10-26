import { Component, Input } from '@angular/core'
import { LandingLinkComponent } from '../link/landing-link.component'
import { PRICING } from 'src/app/core/constants'
import { Router } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'
import { CheckoutService, CreatorBillingPeriod } from 'src/app/core/services/checkout.service'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'

@Component({
  selector: 'polo-pricing',
  standalone: true,
  imports: [LandingLinkComponent, BasicButtonComponent, TranslatePipe],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  pricing = PRICING
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

  constructor(
    private router: Router,
    public db: DatabaseService,
    private i18n: I18nService,
    private checkout: CheckoutService
  ) {}

  price(value: number) {
    return this.i18n.formatNumber(value, { minimumFractionDigits: 2 })
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

  cancelSubscription() {
    this.cancelingSubscription = true

    const jwtToken = localStorage.getItem('sb-lsemostpqoguehpsbzgu-auth-token')
    if (!jwtToken) {
      return console.error('No present JWT. Cant cancel plan.')
    }

    fetch(
      'https://lsemostpqoguehpsbzgu.supabase.co/functions/v1/cancel-subscription-request',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(jwtToken).access_token}`,
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          const user = this.db.user()
          if (user) user.profile.subscription_status = 'canceled'
        } else {
          alert(this.i18n.t('pricing.cancelFailed'))
        }

        this.cancelingSubscription = false
      })
      .catch((error) => {
        console.error(error)
        alert(this.i18n.t('pricing.cancelFailed'))

        this.cancelingSubscription = false
      })
  }
}

function checkPlan(value: string | undefined) {
  if (!value) return
  if (value.includes('creator')) return 'creator'
  if (value.includes('pro')) return 'legacy-pro'
  return undefined
}
