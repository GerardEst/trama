import { Inject, Injectable, InjectionToken } from '@angular/core'
import { environment } from 'src/environments/environment'

export type CreatorBillingPeriod = 'monthly' | 'yearly'

export const CHECKOUT_REDIRECT = new InjectionToken<(url: string) => void>('Checkout redirect', {
  providedIn: 'root',
  factory: () => url => window.location.assign(url),
})

/**
 * Creator (Creative on the site) is free for now, so nothing sends anyone to pay for it.
 * The checkout stays here, closed, for when it costs money again.
 */
export const CREATOR_CHECKOUT_OPEN = false

/** A link that names Creator: while it is free, it only opens the sign-up. */
export function isCreatorLink(plan: unknown): boolean {
  return plan === 'creator'
}

export function isCreatorCheckout(plan: unknown, period: unknown): period is CreatorBillingPeriod {
  return CREATOR_CHECKOUT_OPEN && isCreatorLink(plan) && (period === 'monthly' || period === 'yearly')
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
