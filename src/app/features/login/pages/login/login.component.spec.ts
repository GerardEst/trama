import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { AuthApiError, Session, SupabaseClient } from '@supabase/supabase-js'
import { DatabaseService } from 'src/app/core/services/database.service'
import { CHECKOUT_REDIRECT } from 'src/app/core/services/checkout.service'
import { LoginComponent } from './login.component'

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>

  let auth: jasmine.SpyObj<SupabaseClient['auth']>
  let redirect: jasmine.Spy
  let getUser: jasmine.Spy
  const session: Session = {
    access_token: 'test', refresh_token: 'test', token_type: 'bearer', expires_in: 3600,
    user: { id: 'author', email: 'verified+author@example.com', aud: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '' },
  }

  beforeEach(() => {
    auth = jasmine.createSpyObj('auth', ['signInWithPassword', 'signUp', 'signInWithOAuth'])
    auth.signInWithPassword.and.resolveTo({ data: { session, user: session.user }, error: null })
    auth.signUp.and.resolveTo({ data: { session, user: session.user }, error: null })
    auth.signInWithOAuth.and.resolveTo({ data: { provider: 'google', url: 'https://example.com/oauth' }, error: null })
    getUser = jasmine.createSpy('getUser').and.resolveTo(false)
    redirect = jasmine.createSpy('redirect')
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]),
        { provide: DatabaseService, useValue: { supabase: { auth }, getUser } },
        { provide: CHECKOUT_REDIRECT, useValue: redirect },
      ],
    })
    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  async function selectCreator(period = 'monthly') {
    component.plan = 'creator'
    component.period = period
    await component.ngOnInit()
    component.login_email.setValue('submitted@example.com')
    component.login_password.setValue('test-password')
    component.register_email.setValue('submitted@example.com')
    component.register_password.setValue('test-password')
    component.register_username.setValue('Author')
  }

  it('registers old Creator links for free and opens the dashboard, never Stripe', async () => {
    await selectCreator('yearly')
    fixture.detectChanges()
    expect(component.subscribing).toBeFalse()
    expect(component.checkoutUnavailable).toBeFalse()
    expect((fixture.nativeElement as HTMLElement).querySelector('.checkoutSummary, .checkoutNotice')).toBeNull()
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    expect(navigate).toHaveBeenCalledWith(['/dashboard'])
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    expect(navigate).toHaveBeenCalledTimes(2)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns Google OAuth and email confirmation to the dashboard, with no checkout to continue', async () => {
    await selectCreator('yearly')
    await component.signInWithGoogle()
    const url = new URL(auth.signInWithOAuth.calls.mostRecent().args[0].options!.redirectTo!)
    expect(url.pathname).toBe('/dashboard')
    expect(url.searchParams.has('checkout')).toBeFalse()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('does not open a checkout from an old callback URL', async () => {
    await selectCreator()
    component.checkout = 'continue'
    getUser.and.resolveTo({ email: session.user.email })
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    await component.ngOnInit()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('rejects old Pro subscription links instead of silently buying Creator', async () => {
    await selectCreator()
    component.plan = 'pro'
    await component.ngOnInit()
    fixture.detectChanges()
    expect(component.checkoutUnavailable).toBeTrue()
    expect(fixture.nativeElement.textContent).toContain('Pro is planned as a one-time purchase')
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('uses the landing palette and typography', () => {
    const host = fixture.nativeElement as HTMLElement
    const style = getComputedStyle(host)
    const theme = getComputedStyle(document.documentElement)
    expect(style.backgroundColor).toBe(getComputedStyle(document.body).backgroundColor)
    expect(style.getPropertyValue('--polo-color-action')).toBe(theme.getPropertyValue('--polo-color-action'))
    expect(style.getPropertyValue('--polo-color-accent').trim()).toBe('#f6ce6a')
    expect(style.backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(host.querySelector('h1')!).fontFamily).toContain('Raleway')
  })

  it('uses a yellow primary action in both login and registration', () => {
    const host = fixture.nativeElement as HTMLElement
    const loginButton = host.querySelector('.form__footer button')!
    expect(getComputedStyle(loginButton).backgroundColor).toBe('rgb(246, 206, 106)')

    component.mode = 'register'
    fixture.detectChanges()
    const registerButton = host.querySelector('form > polo-basic-button button')!
    expect(getComputedStyle(registerButton).backgroundColor).toBe('rgb(246, 206, 106)')
  })
})
