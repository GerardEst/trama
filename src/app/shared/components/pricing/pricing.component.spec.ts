import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PricingComponent } from './pricing.component'
import { provideRouter, Router } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { CHECKOUT_REDIRECT } from 'src/app/core/services/checkout.service'

describe('PricingComponent', () => {
  let component: PricingComponent
  let fixture: ComponentFixture<PricingComponent>
  let redirect: jasmine.Spy

  beforeEach(async () => {
    redirect = jasmine.createSpy('redirect')
    await TestBed.configureTestingModule({
      imports: [PricingComponent],
      providers: [provideRouter([]),
        { provide: DatabaseService, useValue: { user: () => undefined } },
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

  it('changes only Creator when switching to annual billing', () => {
    component.payAnnually = true
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('49.95€/year')
    expect(fixture.nativeElement.querySelector('.pricing__plan--pro').textContent).toContain('Around 200€')
  })

  it('takes unauthenticated buyers to registration with their selected period', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    component.subscribe('creator', true)
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { mode: 'register', plan: 'creator', period: 'yearly' } })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('takes a signed-in author to Creator checkout without opening a popup', () => {
    component.email = 'author@example.com'
    component.subscribe('creator', false)
    expect(redirect).toHaveBeenCalledTimes(1)
    expect(new URL(redirect.calls.mostRecent().args[0]).searchParams.get('prefilled_email')).toBe('author@example.com')
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
    const link = host.querySelector('polo-landing-link button')!
    const background = getComputedStyle(plan).backgroundColor
    const radius = getComputedStyle(link).borderRadius
    host.classList.add('landing-pricing')
    expect(getComputedStyle(plan).backgroundColor).toBe(background)
    expect(getComputedStyle(link).borderRadius).toBe(radius)
  })
})
