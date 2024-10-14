import { Component, Input } from '@angular/core'
import { LandingButtonComponent } from 'src/app/pages/landingpage/components/button/landing-button.component'
import { PRICING } from 'src/app/constants'
import { Router } from '@angular/router'
import { DatabaseService } from 'src/app/services/database.service'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'

@Component({
  selector: 'polo-pricing',
  standalone: true,
  imports: [LandingButtonComponent, BasicButtonComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.sass',
})
export class PricingComponent {
  @Input() payAnnually: boolean = false
  @Input() email?: string

  pricing = PRICING

  constructor(private router: Router, public db: DatabaseService) {}

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
      paymentLink = PRICING.CREATOR_MONTHLY_LINK
    }
    if (period === 'monthly' && plan === 'pro') {
      paymentLink = PRICING.PRO_MONTHLY_LINK
    }
    if (period === 'yearly' && plan === 'creator') {
      paymentLink = PRICING.CREATOR_YEARLY_LINK
    }
    if (period === 'yearly' && plan === 'pro') {
      paymentLink = PRICING.PRO_YEARLY_LINK
    }

    window.open(paymentLink + '?prefilled_email=' + email)
  }

  cancelPlan() {
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
      })
      .catch((error) => {
        console.error(error)
        alert('Failed to cancel subscription')
      })
  }
}
