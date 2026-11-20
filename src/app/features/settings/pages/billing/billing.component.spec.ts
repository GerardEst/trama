import { TestBed } from '@angular/core/testing'
import { BillingComponent } from './billing.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('BillingComponent', () => {
  it('shows the plans under the page title without repeating it', () => {
    TestBed.configureTestingModule({ imports: [BillingComponent] })
    TestBed.inject(DatabaseService).user.set({
      email: 'author@example.com',
      user_metadata: { user_name: 'Author' },
      app_metadata: { provider: 'email' },
      profile: { plan: 'free', subscription_status: 'active', next_payment: '' },
    } as unknown as appUser)
    const fixture = TestBed.createComponent(BillingComponent)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('h1')?.textContent).toContain('Plan and billing')
    expect(host.querySelector('polo-billing-settings polo-pricing')).toBeTruthy()
    expect(host.querySelector('polo-billing-settings .txt-l')).toBeNull()
  })
})
