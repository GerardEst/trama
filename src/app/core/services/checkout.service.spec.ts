import { TestBed } from '@angular/core/testing'
import { CHECKOUT_REDIRECT, CREATOR_CHECKOUT_OPEN, CheckoutService, isCreatorCheckout } from './checkout.service'
import { environment } from 'src/environments/environment'

describe('CheckoutService', () => {
  let service: CheckoutService
  let redirect: jasmine.Spy
  beforeEach(() => {
    redirect = jasmine.createSpy('redirect')
    TestBed.configureTestingModule({ providers: [{ provide: CHECKOUT_REDIRECT, useValue: redirect }] })
    service = TestBed.inject(CheckoutService)
  })

  it('never sends anyone to pay for Creator while it is free', () => {
    expect(CREATOR_CHECKOUT_OPEN).toBeFalse()
    for (const period of ['monthly', 'yearly']) {
      expect(isCreatorCheckout('creator', period)).toBeFalse()
      expect(service.start('creator', period, 'author+story@example.com')).toBeFalse()
    }
    expect(redirect).not.toHaveBeenCalled()
  })

  it('never opens old Pro subscriptions, malformed periods or empty identities', () => {
    for (const plan of ['pro', 'free', 'basic', 'https://example.com', undefined]) {
      expect(service.start(plan, 'monthly', 'author@example.com')).toBeFalse()
    }
    expect(service.start('creator', 'one-time', 'author@example.com')).toBeFalse()
    expect(service.start('creator', 'monthly', '')).toBeFalse()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns OAuth and email confirmation straight to the dashboard, with no checkout to continue', () => {
    expect(service.authReturnUrl('creator', 'yearly')).toBe(`${environment.baseRoute}/dashboard`)
    expect(service.authReturnUrl('pro', 'monthly')).toBe(`${environment.baseRoute}/dashboard`)
  })
})
