import { describe, expect, it } from 'vitest'
import { atlasFor } from '../components/landing/atlas'
import { LANGS } from '../i18n'
import { APP_LINKS } from './links'
import { BILLING_PERIODS, PLANS, checkoutLink, formatPrice, planOffers, twelveMonths, type PlanId } from './plans'

const IDS = Object.keys(PLANS) as PlanId[]

describe('plans', () => {
  it('writes prices the way each language does', () => {
    expect(formatPrice('en', PLANS.creative.monthly)).toBe('€5.95')
    expect(formatPrice('es', PLANS.creative.yearly).replace(/\s/g, ' ')).toBe('49,95 €')
    expect(formatPrice('ca', PLANS.creative.monthly).replace(/\s/g, ' ')).toBe('5,95 €')
  })

  it('never promises a better yearly deal than the prices give', () => {
    for (const id of IDS) {
      const { monthly, yearly } = PLANS[id]
      expect(yearly).toBeLessThan(monthly * 12)
      expect(twelveMonths(id)).toBeCloseTo(monthly * 12, 2)
      expect(twelveMonths(id)).toBeGreaterThan(yearly)
    }
    expect(twelveMonths('creative')).toBe(71.4)
    expect(twelveMonths('pro')).toBe(239.4)
    expect(PLANS.pro.monthly).toBeGreaterThan(PLANS.creative.monthly)
  })

  it('sends Creative to the checkout the app knows, in the chosen period', () => {
    expect(checkoutLink('monthly')).toBe(APP_LINKS.register)
    for (const period of BILLING_PERIODS) {
      const url = new URL(checkoutLink(period), 'https://trama.app')
      expect(url.pathname).toBe('/login')
      expect(Object.fromEntries(url.searchParams)).toEqual({ mode: 'register', plan: 'creator', period })
    }
  })

  it('is the price the landing quotes in every language', () => {
    const spaces = (text: string) => text.replace(/\s/g, ' ')
    for (const lang of LANGS) {
      const c = atlasFor(lang)
      const quotes = [c.rows.price.trama, c.faq.map(item => item.answer).join(' '), c.facts.map(fact => fact.value).join(' ')]
      for (const text of quotes) {
        expect(spaces(text)).toContain(spaces(formatPrice(lang, PLANS.creative.monthly)))
        expect(spaces(text)).toContain(spaces(formatPrice(lang, PLANS.creative.yearly)))
      }
      expect(c.wins.map(win => win.body).join(' ')).toContain(`${PLANS.creative.name} `)
    }
  })

  it('offers for sale only the plans that can be bought', () => {
    expect(PLANS.pro.available).toBe(false)
    expect(planOffers().map(offer => offer.name)).toEqual(['Creative (monthly)', 'Creative (yearly)'])
  })
})
