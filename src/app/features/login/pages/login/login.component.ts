import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/core/services/database.service'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/shared/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { LOGIN_FEEDBACKS } from '../../constants'
import { GoogleLoginComponent } from 'src/app/shared/components/ui/google-login/google-login.component'
import { LanguageSelectorComponent } from 'src/app/shared/components/ui/language-selector/language-selector.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { CheckoutService, isCreatorCheckout } from 'src/app/core/services/checkout.service'
import { PRICING } from 'src/app/core/constants'
import { I18nService } from 'src/app/core/i18n/i18n.service'

@Component({
  selector: 'polo-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SeparatorComponent, BasicButtonComponent, GoogleLoginComponent, LanguageSelectorComponent, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['../login-shared.css', './login.component.css'],
})
export class LoginComponent implements OnInit {
  LOGIN_FEEDBACKS = LOGIN_FEEDBACKS
  @Input() mode?: 'register' | 'login'
  // Treat route inputs as untrusted, including old Pro subscription URLs.
  @Input() period?: string
  @Input() plan?: string
  @Input() checkout?: string

  login_email = new FormControl('', [Validators.required, Validators.email])
  login_password = new FormControl('', Validators.required)
  register_email = new FormControl('', [Validators.required, Validators.email])
  register_password = new FormControl('', Validators.required)
  register_username = new FormControl('', Validators.required)
  emailAlreadyRegistered = false
  waitingForSignUp = false
  subscribing = false
  checkoutUnavailable = false
  authenticationError = false
  checkMail = false

  constructor(
    private db: DatabaseService,
    private router: Router,
    private checkoutService: CheckoutService,
    private i18n: I18nService
  ) {}

  get selectedPrice() {
    return this.i18n.formatNumber(this.period === 'yearly' ? PRICING.CREATOR_YEARLY_PRICE : PRICING.CREATOR_MONTHLY_PRICE, {
      minimumFractionDigits: 2,
    })
  }

  async ngOnInit() {
    this.subscribing = isCreatorCheckout(this.plan, this.period)
    this.checkoutUnavailable = !!(this.plan || this.period) && !this.subscribing
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
    }
  }

  private completeAuthentication(email?: string) {
    if (this.checkoutUnavailable) return
    if (this.subscribing) {
      if (!email || !this.checkoutService.start(this.plan, this.period, email)) this.authenticationError = true
    } else {
      this.router.navigate(['/dashboard'])
    }
  }

  async signUpNewUser(event: Event, email: FormControl, password: FormControl, username: FormControl) {
    event.preventDefault()
    if (email.invalid || password.invalid || username.invalid || this.waitingForSignUp) return
    this.waitingForSignUp = true
    this.authenticationError = false
    this.emailAlreadyRegistered = false
    this.checkMail = false
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
        this.authenticationError = !this.emailAlreadyRegistered
        return
      }
      if (!data.session) {
        this.checkMail = true
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
    if (email.invalid || password.invalid || this.waitingForSignUp) return
    this.waitingForSignUp = true
    this.authenticationError = false
    try {
      const { data, error } = await this.db.supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error || !data.session) {
        this.authenticationError = true
        return
      }
      this.completeAuthentication(data.session.user.email)
    } catch {
      this.authenticationError = true
    } finally {
      this.waitingForSignUp = false
    }
  }

  goToRegister() { this.mode = 'register' }
  goToLogin() { this.mode = 'login' }
}
