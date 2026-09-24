import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { ProfileModalComponent } from './profile-modal.component'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('ProfileModalComponent', () => {
  let component: ProfileModalComponent
  let fixture: ComponentFixture<ProfileModalComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileModalComponent, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(ProfileModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('switches the authoring theme from the account modal', () => {
    const previous = localStorage.getItem('polo-theme')
    const previousAttribute = document.documentElement.dataset['poloTheme']
    component.db.user.set({
      email: 'author@example.com',
      user_metadata: { user_name: 'Author' },
      app_metadata: { provider: 'email' },
      profile: { plan: 'free', subscription_status: 'active', next_payment: '' },
    } as unknown as appUser)
    fixture.detectChanges()

    try {
      const toggle = fixture.nativeElement.querySelector('#night-mode') as HTMLInputElement
      expect(toggle).toBeTruthy()
      expect(toggle.checked).toBe(component.theme.dark())
      toggle.click()
      fixture.detectChanges()
      expect(component.theme.dark()).toBe(toggle.checked)
      expect(document.documentElement.dataset['poloTheme']).toBe(toggle.checked ? 'dark' : 'light')
    } finally {
      if (previous === null) localStorage.removeItem('polo-theme')
      else localStorage.setItem('polo-theme', previous)
      if (previousAttribute) document.documentElement.dataset['poloTheme'] = previousAttribute
      else delete document.documentElement.dataset['poloTheme']
    }
  })
})
