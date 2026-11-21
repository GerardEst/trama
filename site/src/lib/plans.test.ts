import { describe, expect, it } from 'vitest'
import { atlasFor } from '../components/landing/atlas'
import { LANGS } from '../i18n'
import { APP_LINKS } from './links'
import { PLANS, formatPrice, isFree, planOffers, twelveMonths } from './plans'

describe('plans', () => {
  it('writes prices the way each language does', () => {
    expect(formatPrice('en', PLANS.pro.monthly)).toBe('€19.95')
    expect(formatPrice('es', PLANS.pro.yearly).replace(/\s/g, ' ')).toBe('199,95 €')
    expect(formatPrice('ca', PLANS.pro.monthly).replace(/\s/g, ' ')).toBe('19,95 €')
  })

  it('makes Creative free and keeps Pro paid', () => {
    expect(isFree('creative')).toBe(true)
    expect(isFree('pro')).toBe(false)
  })

  it('never promises a better yearly deal than the prices give', () => {
    const { monthly, yearly } = PLANS.pro
    expect(yearly).toBeLessThan(monthly * 12)
    expect(twelveMonths('pro')).toBe(239.4)
    expect(twelveMonths('pro')).toBeGreaterThan(yearly)
  })

  it('sends Creative to a plain sign-up, with no plan or checkout in the link', () => {
    const url = new URL(APP_LINKS.register, 'https://trama.app')
    expect(url.pathname).toBe('/login')
    expect(Object.fromEntries(url.searchParams)).toEqual({ mode: 'register' })
  })

  it('says on the landing, in every language, that Creative is free and quotes no old price', () => {
    const free = { en: 'free', es: 'gratis', ca: 'gratis' }
    for (const lang of LANGS) {
      const c = atlasFor(lang)
      const quotes = [c.rows.price.trama, c.faq.map(item => item.answer).join(' '), c.facts.map(fact => fact.value).join(' ')]
      for (const text of quotes) {
        expect(text.toLowerCase()).toContain(free[lang])
        expect(text).not.toMatch(/5[.,]95|49[.,]95/)
      }
    }
  })

  it('offers Creative at no cost and not Pro, which cannot be bought yet', () => {
    expect(PLANS.pro.available).toBe(false)
    expect(planOffers()).toEqual([{ '@type': 'Offer', name: 'Creative', price: '0.00', priceCurrency: 'EUR' }])
  })
})
