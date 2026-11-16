import type { Lang } from '../i18n'

// The plans and their prices, in euros: the one place the site reads them from.
// Pro is announced with its price but cannot be bought yet.
export const PLANS = {
  creative: { name: 'Creative', monthly: 5.95, yearly: 49.95, available: true },
  pro: { name: 'Pro', monthly: 19.95, yearly: 199.95, available: false },
} as const

export type PlanId = keyof typeof PLANS

export const BILLING_PERIODS = ['monthly', 'yearly'] as const
export type BillingPeriod = (typeof BILLING_PERIODS)[number]

/** A price as each language writes it: €5.95 in English, 5,95 € in Spanish and Catalan. */
export function formatPrice(lang: Lang, amount: number): string {
  return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount)
}

/** What a year costs paid month by month: the price the yearly plan is compared with. */
export function twelveMonths(plan: PlanId): number {
  return Math.round(PLANS[plan].monthly * 12 * 100) / 100
}

/** The plans on sale as schema.org offers, for the pages' structured data. */
export function planOffers() {
  return (Object.keys(PLANS) as PlanId[]).filter(id => PLANS[id].available).flatMap(id =>
    BILLING_PERIODS.map(period => ({
      '@type': 'Offer',
      name: `${PLANS[id].name} (${period})`,
      price: PLANS[id][period].toFixed(2),
      priceCurrency: 'EUR',
    })),
  )
}

/** Where Creative is bought: the app's sign-up and checkout, which knows the plan as `creator`. */
export function checkoutLink(period: BillingPeriod): string {
  return `/login?mode=register&plan=creator&period=${period}`
}
