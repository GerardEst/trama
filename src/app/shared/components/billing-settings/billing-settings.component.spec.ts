import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { BillingSettingsComponent } from './billing-settings.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('BillingSettingsComponent', () => {
  let fixture: ComponentFixture<BillingSettingsComponent>
  const host = () => fixture.nativeElement as HTMLElement

  async function render(profile: Record<string, string>) {
    await TestBed.configureTestingModule({
      imports: [BillingSettingsComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    TestBed.inject(DatabaseService).user.set({ id: 'author-1', email: 'marta@example.com', profile } as unknown as appUser)
    fixture = TestBed.createComponent(BillingSettingsComponent)
    fixture.componentRef.setInput('heading', false)
    fixture.detectChanges()
  }

  it('says first which plan the person has and when it renews, and hides the billing period they cannot use', async () => {
    await render({ plan: 'creator', subscription_status: 'active', next_payment: '2026-12-20T00:00:00Z' })
    expect(host().querySelector('.summary__plan')?.textContent?.trim()).toBe('Creator')
    expect(host().querySelector('.summary__state')?.textContent).toContain('December')
    expect(host().querySelector('polo-billing-cycle')).toBeNull()
  })

  it('gives free Creator to someone without a subscription, with no billing period to choose', async () => {
    await render({ plan: '', subscription_status: '' })
    expect(host().querySelector('.summary__plan')?.textContent?.trim()).toBe('Creator')
    expect(host().querySelector('.summary__state')?.textContent?.trim()).toBe('Free')
    expect(host().querySelector('polo-billing-cycle')).toBeNull()
  })

  it('says an old canceled subscription is canceled, without offering to pay for Creator', async () => {
    await render({ plan: 'pro', subscription_status: 'canceled' })
    expect(host().querySelector('.summary__plan')?.textContent?.trim()).toBe('Pro (legacy)')
    expect(host().querySelector('.summary__state--off')?.textContent).toContain('Subscription canceled')
    expect(host().querySelector('polo-billing-cycle')).toBeNull()
  })

  it('shows until when a canceled plan lasts, and nothing once it has ended', async () => {
    await render({ plan: 'creator', subscription_status: 'canceled', next_payment: new Date(Date.now() + 10 * 86400000).toISOString() })
    expect(host().querySelector('.canceledPlanEnd')?.textContent).toContain('active until')

    TestBed.inject(DatabaseService).user.set({
      id: 'author-1', email: 'marta@example.com',
      profile: { plan: 'creator', subscription_status: 'canceled', next_payment: new Date(Date.now() - 86400000).toISOString() },
    } as unknown as appUser)
    fixture.detectChanges()
    expect(host().querySelector('.canceledPlanEnd')).toBeNull()
  })
})
