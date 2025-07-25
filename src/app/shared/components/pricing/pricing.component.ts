import { Component, Input } from '@angular/core'
import { LandingLinkComponent } from '../link/landing-link.component'
import { PRICING } from 'src/app/core/constants'
import { Router } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'polo-pricing',
  standalone: true,
  imports: [LandingLinkComponent, BasicButtonComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.sass',
})
export class PricingComponent {
  pricing = PRICING

  @Input({ transform: checkPlan }) userPlan?: string | undefined
  @Input() canceledSubscription: boolean = false
  @Input() payAnnually: boolean = false
  @Input() email?: string
  @Input() preventEasyDowngrading: boolean = false
  @Input() dashed: boolean = false

  cancelingSubscription: boolean = false

  constructor(
    private router: Router,
    public db: DatabaseService
  ) {}

  subscribe(plan: 'creator' | 'pro', isYearlyPlan: boolean) {
    this.email
      ? this.upgradePlan(plan, isYearlyPlan ? 'yearly' : 'monthly', this.email)
      : this.router.navigate(['/login'], {
          queryParams: {
            mode: 'register',
            plan,
            period: isYearlyPlan ? 'yearly' : 'monthly',
          },
        })
  }

  upgradePlan(
    plan: 'creator' | 'pro',
    period: 'monthly' | 'yearly',
    email: string
  ) {
    let paymentLink: string | undefined = undefined

    if (period === 'monthly' && plan === 'creator') {
      paymentLink = environment.subscriptionLinks.CREATOR_MONTHLY_LINK
    }
    if (period === 'monthly' && plan === 'pro') {
      paymentLink = environment.subscriptionLinks.PRO_MONTHLY_LINK
    }
    if (period === 'yearly' && plan === 'creator') {
      paymentLink = environment.subscriptionLinks.CREATOR_YEARLY_LINK
    }
    if (period === 'yearly' && plan === 'pro') {
      paymentLink = environment.subscriptionLinks.PRO_YEARLY_LINK
    }

    window.open(paymentLink + '?prefilled_email=' + email)
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
          this.db.user().profile.subscription_status = 'canceled'
        } else {
          alert('Failed to cancel subscription')
        }

        this.cancelingSubscription = false
      })
      .catch((error) => {
        console.error(error)
        alert('Failed to cancel subscription')

        this.cancelingSubscription = false
      })
  }
}

function checkPlan(value: string | undefined) {
  if (!value) return
  if (value.includes('creator')) return 'creator'
  if (value.includes('pro')) return 'pro'
  return 'free'
}
