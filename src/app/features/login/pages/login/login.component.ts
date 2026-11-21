import { Component, Input, OnInit, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/core/services/database.service'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { isAuthWeakPasswordError } from '@supabase/supabase-js'
import { SeparatorComponent } from 'src/app/shared/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { GoogleLoginComponent } from 'src/app/shared/components/ui/google-login/google-login.component'
import { LanguageSelectorComponent } from 'src/app/shared/components/ui/language-selector/language-selector.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { CheckoutService, isCreatorCheckout, isCreatorLink } from 'src/app/core/services/checkout.service'
import { AuthService } from 'src/app/core/services/auth.service'
import { PRICING } from 'src/app/core/constants'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { WordmarkComponent } from 'src/app/shared/components/wordmark/wordmark.component'
import { SITE_PAGES, siteUrl } from 'src/app/core/site-links'
import { safeReturnUrl } from '../../return-url'

/** Supabase's own minimum, so the form refuses what the server would refuse. */
export const MIN_PASSWORD_LENGTH = 6

type ResendState = 'idle' | 'sending' | 'sent' | 'error'

@Component({
  selector: 'polo-login',
  standalone: true,
  imports: [WordmarkComponent, CommonModule, ReactiveFormsModule, RouterLink, SeparatorComponent, BasicButtonComponent, GoogleLoginComponent, LanguageSelectorComponent, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['../login-shared.css', './login.component.css'],
})
export class LoginComponent implements OnInit {
  readonly minPasswordLength = MIN_PASSWORD_LENGTH
  @Input() mode?: 'register' | 'login'
  // Treat route inputs as untrusted, including old Pro subscription URLs.
  @Input() period?: string
  @Input() plan?: string
  @Input() checkout?: string
  /** The page the guard stopped, to open once signed in. Untrusted: see safeReturnUrl. */
  @Input() returnUrl?: string

  login_email = new FormControl('', [Validators.required, Validators.email])
  login_password = new FormControl('', Validators.required)
  register_email = new FormControl('', [Validators.required, Validators.email])
  register_password = new FormControl('', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)])
  register_username = new FormControl('', Validators.required)
  emailAlreadyRegistered = false
  emailNotConfirmed = false
  weakPassword = false
  waitingForSignUp = false
  subscribing = false
  checkoutUnavailable = false
  authenticationError = false
  /** The address a confirmation link was sent to, while the person goes to open it. */
  checkMail: string | null = null
  resendState: ResendState = 'idle'
  /** Someone who is already signed in, back from checkout or here by hand. */
  signedInEmail: string | null = null
  /** Field errors only show once the person has tried to send the form. */
  loginAttempted = false
  registerAttempted = false
  readonly homeUrl = computed(() => siteUrl(this.i18n.lang()))

  constructor(
    private db: DatabaseService,
    private router: Router,
    private checkoutService: CheckoutService,
    private i18n: I18nService,
    private auth: AuthService
  ) {}

  get termsUrl() {
    return siteUrl(this.i18n.lang(), SITE_PAGES.terms)
  }

  get privacyUrl() {
    return siteUrl(this.i18n.lang(), SITE_PAGES.privacy)
  }

  get selectedPrice() {
    return this.i18n.formatNumber(this.period === 'yearly' ? PRICING.CREATOR_YEARLY_PRICE : PRICING.CREATOR_MONTHLY_PRICE, {
      minimumFractionDigits: 2,
    })
  }

  async ngOnInit() {
    this.subscribing = isCreatorCheckout(this.plan, this.period)
    // Creator is free for now: its old links register like any other, without a notice.
    this.checkoutUnavailable = !!(this.plan || this.period) && !this.subscribing && !isCreatorLink(this.plan)
    if (this.checkout === 'continue' && this.subscribing) {
      // OAuth and email confirmation return to the app first, never straight to Stripe.
      try {
        const user = await this.db.getUser()
        if (user && user.email) {
          await this.router.navigate([], { queryParams: { checkout: null }, queryParamsHandling: 'merge', replaceUrl: true })
          this.checkoutService.start(this.plan, this.period, user.email)
        }
      } catch {
        this.authenticationError = true
      }
      return
    }
    // A verified user, not just a stored session: a failed check shows the form, so a
    // network error can never bounce between here and the guarded pages.
    const user = await this.db.getUser()
    if (!user) return
    if (this.subscribing || this.checkoutUnavailable) this.signedInEmail = user.email ?? ''
    else this.router.navigateByUrl(safeReturnUrl(this.returnUrl), { replaceUrl: true })
  }

  /** The message under a field, once the person has tried to send its form. */
  fieldError(control: FormControl, attempted: boolean): TranslationKey | null {
    if (!attempted || control.valid) return null
    if (control.hasError('required')) return 'login.validation.required'
    if (control.hasError('email')) return 'login.validation.email'
    if (control.hasError('minlength')) return 'login.validation.passwordLength'
    return null
  }

  continueToPayment() {
    if (!this.signedInEmail || !this.checkoutService.start(this.plan, this.period, this.signedInEmail)) {
      this.authenticationError = true
    }
  }

  signOut() {
    this.auth.logoutUser()
    this.signedInEmail = null
  }

  private completeAuthentication(email?: string) {
    if (this.checkoutUnavailable) return
    if (this.subscribing) {
      if (!email || !this.checkoutService.start(this.plan, this.period, email)) this.authenticationError = true
    } else {
      this.router.navigateByUrl(safeReturnUrl(this.returnUrl))
    }
  }

  /** Moves the keyboard to the first field that needs fixing. */
  private focusFirstInvalid(fields: [string, FormControl][]) {
    const invalid = fields.find(([, control]) => control.invalid)
    if (invalid) document.getElementById(invalid[0])?.focus()
  }

  async signUpNewUser(event: Event, email: FormControl, password: FormControl, username: FormControl) {
    event.preventDefault()
    if (this.waitingForSignUp) return
    this.registerAttempted = true
    if (email.invalid || password.invalid || username.invalid) {
      this.focusFirstInvalid([['register_username', username], ['register_email', email], ['register_password', password]])
      return
    }
    this.waitingForSignUp = true
    this.authenticationError = false
    this.emailAlreadyRegistered = false
    this.weakPassword = false
    this.checkMail = null
    try {
      const { data, error } = await this.db.supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: this.checkoutService.authReturnUrl(this.plan, this.period),
          data: { user_name: username.value },
        },
      })
      if (error) {
        this.emailAlreadyRegistered = error.message === 'User already registered'
        this.weakPassword = isAuthWeakPasswordError(error)
        this.authenticationError = !this.emailAlreadyRegistered && !this.weakPassword
        return
      }
      if (!data.session) {
        this.checkMail = email.value
        this.resendState = 'idle'
        return
      }
      this.completeAuthentication(data.session.user.email)
    } catch {
      this.authenticationError = true
    } finally {
      this.waitingForSignUp = false
    }
  }

  async signInWithGoogle() {
    if (this.waitingForSignUp) return
    this.waitingForSignUp = true
    this.authenticationError = false
    try {
      const { error } = await this.db.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: this.checkoutService.authReturnUrl(this.plan, this.period) },
      })
      if (error) this.authenticationError = true
    } catch {
      this.authenticationError = true
    } finally {
      this.waitingForSignUp = false
    }
  }

  async signInWithEmail(event: Event, email: FormControl, password: FormControl) {
    event.preventDefault()
    if (this.waitingForSignUp) return
    this.loginAttempted = true
    if (email.invalid || password.invalid) {
      this.focusFirstInvalid([['login_email', email], ['login_password', password]])
      return
    }
    this.waitingForSignUp = true
    this.authenticationError = false
    this.emailNotConfirmed = false
    this.resendState = 'idle'
    try {
      const { data, error } = await this.db.supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error || !data.session) {
        this.emailNotConfirmed = error?.message === 'Email not confirmed'
        this.authenticationError = !this.emailNotConfirmed
        return
      }
      this.completeAuthentication(data.session.user.email)
    } catch {
      this.authenticationError = true
    } finally {
      this.waitingForSignUp = false
    }
  }

  /** Sends the confirmation link again, to the address that signed up or is signing in. */
  async resendConfirmation(email: string | null) {
    if (!email || this.resendState === 'sending') return
    this.resendState = 'sending'
    try {
      const { error } = await this.db.supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: this.checkoutService.authReturnUrl(this.plan, this.period) },
      })
      this.resendState = error ? 'error' : 'sent'
    } catch {
      this.resendState = 'error'
    }
  }

  useAnotherEmail() {
    this.checkMail = null
    this.registerAttempted = false
    setTimeout(() => document.getElementById('register_email')?.focus())
  }

  /** From "this email already has an account": the same address, ready to sign in. */
  signInWithRegisteredEmail() {
    this.login_email.setValue(this.register_email.value)
    this.emailAlreadyRegistered = false
    this.goToLogin()
    setTimeout(() => document.getElementById('login_password')?.focus())
  }

  goToRegister() { this.mode = 'register' }
  goToLogin() { this.mode = 'login' }
}
