import { TestBed } from '@angular/core/testing'
import { CHECKOUT_REDIRECT, CheckoutService } from './checkout.service'
import { environment } from 'src/environments/environment'

describe('CheckoutService', () => {
  let service: CheckoutService
  let redirect: jasmine.Spy
  beforeEach(() => {
    redirect = jasmine.createSpy('redirect')
    TestBed.configureTestingModule({ providers: [{ provide: CHECKOUT_REDIRECT, useValue: redirect }] })
    service = TestBed.inject(CheckoutService)
  })

  it('uses only the configured Creator payment link and encodes the verified email', () => {
    for (const period of ['monthly', 'yearly']) {
      expect(service.start('creator', period, 'author+story@example.com')).toBeTrue()
      const url = new URL(redirect.calls.mostRecent().args[0])
      expect(url.origin + url.pathname).toBe(period === 'yearly'
        ? environment.subscriptionLinks.CREATOR_YEARLY_LINK : environment.subscriptionLinks.CREATOR_MONTHLY_LINK)
      expect(url.searchParams.get('prefilled_email')).toBe('author+story@example.com')
    }
  })

  it('never opens old Pro subscriptions, malformed periods or empty identities', () => {
    for (const plan of ['pro', 'free', 'basic', 'https://example.com', undefined]) {
      expect(service.start(plan, 'monthly', 'author@example.com')).toBeFalse()
    }
    expect(service.start('creator', 'one-time', 'author@example.com')).toBeFalse()
    expect(service.start('creator', 'monthly', '')).toBeFalse()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns OAuth and email confirmation to the app with a validated billing selection', () => {
    const url = new URL(service.authReturnUrl('creator', 'yearly'))
    expect(url.origin).toBe(new URL(environment.baseRoute).origin)
    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('period')).toBe('yearly')
    expect(url.searchParams.get('checkout')).toBe('continue')
    expect(service.authReturnUrl('pro', 'monthly')).toBe(`${environment.baseRoute}/dashboard`)
  })
})
