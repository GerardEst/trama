import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PricingComponent } from './pricing.component'
import { provideRouter } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { CHECKOUT_REDIRECT } from 'src/app/core/services/checkout.service'
import { AlertService } from 'src/app/core/services/alert.service'
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'

describe('PricingComponent', () => {
  let component: PricingComponent
  let fixture: ComponentFixture<PricingComponent>
  let redirect: jasmine.Spy

  beforeEach(async () => {
    redirect = jasmine.createSpy('redirect')
    await TestBed.configureTestingModule({
      imports: [PricingComponent],
      providers: [provideRouter([]),
        { provide: DatabaseService, useValue: { user: () => undefined, cancelSubscription: jasmine.createSpy('cancelSubscription').and.resolveTo(true) } },
        { provide: CHECKOUT_REDIRECT, useValue: redirect },
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(PricingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('offers Creator and a clearly unavailable one-time Pro reference, never Basic', () => {
    const host = fixture.nativeElement as HTMLElement
    expect(Array.from(host.querySelectorAll('.pricing__plan h2')).map(node => node.textContent?.trim())).toEqual(['Creator', 'Pro'])
    const pro = host.querySelector('.pricing__plan--pro')!
    expect(pro.textContent).toContain('Around 200€')
    expect(pro.textContent).toContain('One-time payment')
    expect(pro.textContent).toContain('not a final offer')
    expect(pro.querySelector('a, button')).toBeNull()
    expect(host.textContent).not.toContain('Basic')
  })

  it('shows Creator as the free plan of someone without a subscription, with nothing to buy', () => {
    const creator = (fixture.nativeElement as HTMLElement).querySelector('.recommendedPlan')!
    expect(creator.querySelector('.pricing__plan__header')?.textContent).toContain('Free')
    expect(creator.textContent).not.toContain('5.95')
    expect(creator.querySelector('.currentPlan')?.textContent).toContain('Your current plan')
    expect(creator.querySelector('polo-landing-link')).toBeNull()
  })

  it('never opens a Creator checkout, even when asked directly', () => {
    component.email = 'author@example.com'
    component.subscribe('creator', false)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('still shows what an old Creator subscriber pays, so they can cancel it', () => {
    fixture.componentRef.setInput('userPlan', 'creator')
    fixture.detectChanges()
    const creator = (fixture.nativeElement as HTMLElement).querySelector('.recommendedPlan')!
    expect(creator.textContent).toContain('5.95€/month')
    expect(Array.from(creator.querySelectorAll('button')).some((item) => item.textContent?.includes('Cancel subscription'))).toBeTrue()
  })

  it('does not mislabel a legacy Pro subscription as owning the planned one-time offer', () => {
    fixture.componentRef.setInput('userPlan', 'pro_yearly')
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.legacySubscription').textContent).toContain('has not been migrated automatically')
    expect(fixture.nativeElement.querySelector('.pricing__plan--pro.currentPlan')).toBeNull()
  })

  it('keeps current editor features in the compact Creator comparison', () => {
    component.compactFeatures = true
    fixture.detectChanges()
    const details = fixture.nativeElement.querySelector('.pricing__details') as HTMLDetailsElement
    expect(details.open).toBeFalse()
    expect(details.querySelector('summary')?.hidden).toBeFalse()
    details.querySelector('summary')?.click()
    expect(details.open).toBeTrue()
    expect(details.textContent).toContain('Player tracking and story analytics')
    expect(details.textContent).toContain('JSON')
  })

  it('keeps the same styles regardless of its container', () => {
    const host = fixture.nativeElement as HTMLElement
    const plan = host.querySelector('.pricing__plan')!
    const background = getComputedStyle(plan).backgroundColor
    host.classList.add('landing-pricing')
    expect(getComputedStyle(plan).backgroundColor).toBe(background)
  })

  it('asks before canceling a subscription and cancels only when confirmed', async () => {
    fixture.componentRef.setInput('userPlan', 'creator')
    fixture.detectChanges()
    const launch = spyOn(TestBed.inject(AlertService), 'launch').and.resolveTo(false)
    const cancel = TestBed.inject(DatabaseService).cancelSubscription as jasmine.Spy
    const button = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Cancel subscription'))!
    button().click()
    await fixture.whenStable()
    expect(launch).toHaveBeenCalledOnceWith(ConfirmDialogComponent, jasmine.objectContaining({ danger: true, cancelText: 'Keep subscription' }))
    expect(cancel).not.toHaveBeenCalled()

    launch.and.resolveTo(true)
    button().click()
    await fixture.whenStable()
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it('says in place when canceling failed, without a browser alert', async () => {
    fixture.componentRef.setInput('userPlan', 'creator')
    fixture.detectChanges()
    spyOn(TestBed.inject(AlertService), 'launch').and.resolveTo(true)
    ;(TestBed.inject(DatabaseService).cancelSubscription as jasmine.Spy).and.resolveTo(false)
    const alert = spyOn(window, 'alert')
    await component.cancelSubscription()
    fixture.detectChanges()
    expect(alert).not.toHaveBeenCalled()
    expect((fixture.nativeElement as HTMLElement).querySelector('.cancelError[role="alert"]')?.textContent).toContain('Failed to cancel')
  })

  it('gives free Creator once an old Pro subscription is canceled', () => {
    fixture.componentRef.setInput('userPlan', 'pro')
    fixture.componentRef.setInput('canceledSubscription', true)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('.recommendedPlan.currentPlan')).not.toBeNull()
    expect(host.querySelector('.recommendedPlan polo-landing-link')).toBeNull()
    expect(Array.from(host.querySelectorAll('button')).some((item) => item.textContent?.includes('Cancel subscription'))).toBeFalse()
  })
})
