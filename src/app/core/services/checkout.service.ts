import { Inject, Injectable, InjectionToken } from '@angular/core'
import { environment } from 'src/environments/environment'

export type CreatorBillingPeriod = 'monthly' | 'yearly'

export const CHECKOUT_REDIRECT = new InjectionToken<(url: string) => void>('Checkout redirect', {
  providedIn: 'root',
  factory: () => url => window.location.assign(url),
})

export function isCreatorCheckout(plan: unknown, period: unknown): period is CreatorBillingPeriod {
  return plan === 'creator' && (period === 'monthly' || period === 'yearly')
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(@Inject(CHECKOUT_REDIRECT) private redirect: (url: string) => void) {}

  start(plan: unknown, period: unknown, email: string): boolean {
    // Never reinterpret an old Pro subscription URL as the proposed one-time purchase.
    if (!isCreatorCheckout(plan, period) || !email.trim()) return false
    const link = period === 'yearly'
      ? environment.subscriptionLinks.CREATOR_YEARLY_LINK
      : environment.subscriptionLinks.CREATOR_MONTHLY_LINK
    const url = new URL(link)
    url.searchParams.set('prefilled_email', email.trim())
    this.redirect(url.href)
    return true
  }

  authReturnUrl(plan: unknown, period: unknown): string {
    if (!isCreatorCheckout(plan, period)) return `${environment.baseRoute}/dashboard`
    const url = new URL('/login', environment.baseRoute)
    url.search = new URLSearchParams({ mode: 'login', plan: 'creator', period, checkout: 'continue' }).toString()
    return url.href
  }
}
