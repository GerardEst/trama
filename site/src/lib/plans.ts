import type { Lang } from '../i18n'

// The plans and their prices, in euros: the one place the site reads them from.
// Creative is free for now; Pro is announced with its price but cannot be bought yet.
export const PLANS = {
  creative: { name: 'Creative', monthly: 0, yearly: 0, available: true },
  pro: { name: 'Pro', monthly: 19.95, yearly: 199.95, available: false },
} as const

export type PlanId = keyof typeof PLANS

export const BILLING_PERIODS = ['monthly', 'yearly'] as const
export type BillingPeriod = (typeof BILLING_PERIODS)[number]

/** A price as each language writes it: €5.95 in English, 5,95 € in Spanish and Catalan. */
export function formatPrice(lang: Lang, amount: number): string {
  return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount)
}

/** A plan that costs nothing: the site says so in words, not as 0 €. */
export function isFree(plan: PlanId): boolean {
  return PLANS[plan].monthly === 0 && PLANS[plan].yearly === 0
}

/** What a year costs paid month by month: the price the yearly plan is compared with. */
export function twelveMonths(plan: PlanId): number {
  return Math.round(PLANS[plan].monthly * 12 * 100) / 100
}

/** The plans on sale as schema.org offers, for the pages' structured data. A free plan is
 *  an offer at price 0, which is how schema.org says it costs nothing. */
export function planOffers() {
  return (Object.keys(PLANS) as PlanId[]).filter(id => PLANS[id].available).flatMap(id =>
    isFree(id) ? [{ '@type': 'Offer', name: PLANS[id].name, price: '0.00', priceCurrency: 'EUR' }] : BILLING_PERIODS.map(period => ({
      '@type': 'Offer',
      name: `${PLANS[id].name} (${period})`,
      price: PLANS[id][period].toFixed(2),
      priceCurrency: 'EUR',
    })),
  )
}
