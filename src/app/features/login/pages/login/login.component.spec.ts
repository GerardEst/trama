import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { AuthApiError, AuthWeakPasswordError, Session, SupabaseClient } from '@supabase/supabase-js'
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
    auth = jasmine.createSpyObj('auth', ['signInWithPassword', 'signUp', 'signInWithOAuth', 'resend'])
    auth.signInWithPassword.and.resolveTo({ data: { session, user: session.user }, error: null })
    auth.signUp.and.resolveTo({ data: { session, user: session.user }, error: null })
    auth.signInWithOAuth.and.resolveTo({ data: { provider: 'google', url: 'https://example.com/oauth' }, error: null })
    auth.resend.and.resolveTo({ data: { user: null, session: null }, error: null })
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
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true)
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    expect(navigate).toHaveBeenCalledWith('/dashboard')
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
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true)
    await component.ngOnInit()
    expect(redirect).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledOnceWith('/dashboard', { replaceUrl: true })
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

  const host = () => fixture.nativeElement as HTMLElement
  const showRegister = () => {
    component.mode = 'register'
    fixture.detectChanges()
  }

  it('sends each form with Enter, as a real submit button inside it', async () => {
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true)
    showRegister()
    component.register_username.setValue('Author')
    component.register_email.setValue('submitted@example.com')
    component.register_password.setValue('test-password')
    const submit = host().querySelector<HTMLButtonElement>('form polo-basic-button button')!
    expect(submit.type).toBe('submit')
    host().querySelector('form')!.requestSubmit()
    await fixture.whenStable()
    expect(auth.signUp).toHaveBeenCalledTimes(1)

    component.mode = 'login'
    fixture.detectChanges()
    component.login_email.setValue('submitted@example.com')
    component.login_password.setValue('test-password')
    expect(host().querySelector<HTMLButtonElement>('form .form__footer button')!.type).toBe('submit')
    host().querySelector('form')!.requestSubmit()
    await fixture.whenStable()
    expect(auth.signInWithPassword).toHaveBeenCalledTimes(1)
  })

  it('says what each field needs once the form is sent, and moves to the first one', async () => {
    showRegister()
    expect(host().querySelector('.fieldError')).toBeNull()
    component.register_email.setValue('not-an-email')
    component.register_password.setValue('short')
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    fixture.detectChanges()
    expect(auth.signUp).not.toHaveBeenCalled()
    const errors = Array.from(host().querySelectorAll('.fieldError')).map((error) => error.textContent?.trim())
    expect(errors).toEqual(['Fill in this field.', 'This email does not look right. Check it.', 'Use at least 6 characters.'])
    expect(document.activeElement?.id).toBe('register_username')
    const email = host().querySelector('#register_email')!
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(email.getAttribute('aria-describedby')).toBe('register_email_error')
  })

  it('explains a password the server finds too weak instead of a generic error', async () => {
    showRegister()
    await selectCreator()
    auth.signUp.and.resolveTo({ data: { user: null, session: null }, error: new AuthWeakPasswordError('Weak', 422, ['length']) })
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    fixture.detectChanges()
    expect(component.authenticationError).toBeFalse()
    expect(host().querySelector('#register_password_help')?.textContent).toContain('too easy to guess')
  })

  it('replaces the form with the address to check and lets the link be sent again', async () => {
    showRegister()
    await selectCreator()
    auth.signUp.and.resolveTo({ data: { user: session.user, session: null }, error: null })
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    fixture.detectChanges()
    expect(host().querySelector('form')).toBeNull()
    expect(host().querySelector('.checkMail')?.textContent).toContain('submitted@example.com')

    await component.resendConfirmation(component.checkMail)
    fixture.detectChanges()
    expect(auth.resend).toHaveBeenCalledOnceWith(jasmine.objectContaining({ type: 'signup', email: 'submitted@example.com' }))
    expect(host().textContent).toContain('Sent again')

    component.useAnotherEmail()
    fixture.detectChanges()
    expect(host().querySelector('#register_email')).not.toBeNull()
  })

  it('tells an author who has not confirmed the email, and sends the link again', async () => {
    await selectCreator()
    auth.signInWithPassword.and.resolveTo({ data: { user: null, session: null }, error: new AuthApiError('Email not confirmed', 400) })
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    fixture.detectChanges()
    expect(component.authenticationError).toBeFalse()
    expect(host().querySelector('[role="alert"]')?.textContent).toContain('You have not confirmed your email yet')
    await component.resendConfirmation(component.login_email.value)
    expect(auth.resend).toHaveBeenCalledOnceWith(jasmine.objectContaining({ email: 'submitted@example.com' }))
  })

  it('offers to sign in with an email that already has an account', async () => {
    showRegister()
    await selectCreator()
    auth.signUp.and.resolveTo({ data: { user: null, session: null }, error: new AuthApiError('User already registered', 422) })
    await component.signUpNewUser(new Event('submit'), component.register_email, component.register_password, component.register_username)
    fixture.detectChanges()
    host().querySelector<HTMLButtonElement>('.feedbackMessage--action .login-link')!.click()
    fixture.detectChanges()
    expect(component.mode).toBe('login')
    expect(component.login_email.value).toBe('submitted@example.com')
  })

  it('sends someone already signed in to their stories instead of the form', async () => {
    getUser.and.resolveTo({ email: session.user.email })
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true)
    await component.ngOnInit()
    expect(navigate).toHaveBeenCalledOnceWith('/dashboard', { replaceUrl: true })
  })

  it('returns to the page the guard stopped after signing in, but never to another site', async () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true)
    component.login_email.setValue('submitted@example.com')
    component.login_password.setValue('test-password')
    component.returnUrl = '/story/story-1/statistics'
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    expect(navigate).toHaveBeenCalledWith('/story/story-1/statistics')

    component.returnUrl = '//evil.example'
    await component.signInWithEmail(new Event('submit'), component.login_email, component.login_password)
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('shows the form when the signed-in check fails, so a network error cannot loop with the guard', async () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true)
    await component.ngOnInit()
    fixture.detectChanges()
    expect(navigate).not.toHaveBeenCalled()
    expect(host().querySelector('form')).not.toBeNull()
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
