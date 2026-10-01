import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PricingComponent } from './pricing.component'
import { provideRouter } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'

describe('PricingComponent', () => {
  let component: PricingComponent
  let fixture: ComponentFixture<PricingComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingComponent],
      providers: [
        provideRouter([]),
        { provide: DatabaseService, useValue: { user: () => undefined } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(PricingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('uses the same card and action styles regardless of its container', () => {
    const host = fixture.nativeElement as HTMLElement
    const plan = host.querySelector('.pricing__plan') as HTMLElement
    const link = host.querySelector('polo-landing-link a') as HTMLElement
    const styles = () => ({
      card: [getComputedStyle(plan).backgroundColor, getComputedStyle(plan).padding],
      action: [getComputedStyle(link).backgroundColor, getComputedStyle(link).borderRadius],
    })

    const outsideLanding = styles()
    host.classList.add('landing-pricing')
    expect(styles()).toEqual(outsideLanding)
  })

  it('retains all plans and expanded features by default outside the landing page', () => {
    expect(
      fixture.nativeElement.querySelectorAll('.pricing__plan').length
    ).toBe(3)
    expect(
      fixture.nativeElement.querySelectorAll('.pricing__details[open]').length
    ).toBe(2)
  })

  it('can omit the upcoming plan from the landing comparison', () => {
    component.showUpcomingPlan = false
    fixture.detectChanges()
    expect(
      fixture.nativeElement.querySelectorAll('.pricing__plan').length
    ).toBe(2)
  })

  it('does not hide an existing Pro subscriber’s current plan', () => {
    fixture.componentRef.setInput('showUpcomingPlan', false)
    fixture.componentRef.setInput('userPlan', 'pro')
    fixture.detectChanges()
    expect(
      fixture.nativeElement.querySelectorAll('.pricing__plan').length
    ).toBe(3)
    expect(
      fixture.nativeElement.querySelector('.pricing__plan.currentPlan h2')
        .textContent
    ).toBe('Pro')
  })

  it('makes every feature available in the compact comparison', () => {
    component.compactFeatures = true
    fixture.detectChanges()
    const details = fixture.nativeElement.querySelector(
      '.pricing__details'
    ) as HTMLDetailsElement
    expect(details.open).toBeFalse()
    expect(details.querySelector('summary')?.hidden).toBeFalse()
    expect(details.textContent).toContain('Up to 3 stories')
    details.querySelector('summary')?.click()
    expect(details.open).toBeTrue()
  })
})
