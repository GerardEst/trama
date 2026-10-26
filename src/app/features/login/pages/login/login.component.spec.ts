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

  it('starts Creator checkout only after successful login, using the authenticated email', async () => {
    await selectCreator('yearly')
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    expect(redirect).toHaveBeenCalledTimes(1)
    expect(new URL(redirect.calls.mostRecent().args[0]).searchParams.get('prefilled_email')).toBe(session.user.email!)
    expect(component.waitingForSignUp).toBeFalse()
  })

  it('does not open checkout when login fails or its request rejects', async () => {
    await selectCreator()
    auth.signInWithPassword.and.resolveTo({ data: { user: null, session: null }, error: new AuthApiError('Invalid credentials', 400) })
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    expect(redirect).not.toHaveBeenCalled()
    auth.signInWithPassword.and.rejectWith(new Error('Network error'))
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    expect(component.authenticationError).toBeTrue()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('requires a real signup session before opening payment', async () => {
    await selectCreator()
    auth.signUp.and.resolveTo({ data: { user: session.user, session: null }, error: null })
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    expect(component.checkMail).toBeTrue()
    expect(redirect).not.toHaveBeenCalled()
    auth.signUp.and.resolveTo({ data: { user: session.user, session }, error: null })
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    expect(redirect).toHaveBeenCalledTimes(1)
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

  it('keeps the billing selection across Google OAuth and returns to the app, not Stripe', async () => {
    await selectCreator('yearly')
    await component.signInWithGoogle()
    const options = auth.signInWithOAuth.calls.mostRecent().args[0].options!
    const url = new URL(options.redirectTo!)
    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('period')).toBe('yearly')
    expect(url.searchParams.get('checkout')).toBe('continue')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('verifies the returned identity and clears the callback marker before continuing', async () => {
    await selectCreator()
    component.checkout = 'continue'
    getUser.and.resolveTo({ email: session.user.email })
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    await component.ngOnInit()
    expect(getUser).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith([], { queryParams: { checkout: null }, queryParamsHandling: 'merge', replaceUrl: true })
    expect(redirect).toHaveBeenCalledTimes(1)
  })

  it('does not trust the callback URL as proof of authentication or payment', async () => {
    await selectCreator()
    component.checkout = 'continue'
    await component.ngOnInit()
    expect(getUser).toHaveBeenCalledTimes(1)
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
