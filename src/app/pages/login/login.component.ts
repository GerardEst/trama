import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { environment } from 'src/environments/environment'
import { LOGIN_FEEDBACKS } from 'src/app/constants'

@Component({
  selector: 'polo-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SeparatorComponent,
    BasicButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent {
  LOGIN_FEEDBACKS = LOGIN_FEEDBACKS

  @Input() mode?: 'register' | 'login'
  @Input() selectedPeriod?: 'yearly' | 'monthly'
  @Input() selectedPlan?: 'creator' | 'pro'

  constructor(private db: DatabaseService, private router: Router) {}

  login_email = new FormControl('', [Validators.required, Validators.email])
  login_password = new FormControl('', Validators.required)
  register_email = new FormControl('', [Validators.required, Validators.email])
  register_password = new FormControl('', Validators.required)
  register_username = new FormControl('', Validators.required)
  checkMail: boolean = false
  mailNotConfirmed?: boolean = false

  waitingForSignUp: boolean = false
  subscribing: boolean = false
  paymentLink?: string

  ngOnInit() {
    if (this.selectedPeriod && this.selectedPlan) {
      this.subscribing = true
      if (
        this.selectedPeriod === 'monthly' &&
        this.selectedPlan === 'creator'
      ) {
        this.paymentLink = environment.subscriptionLinks.CREATOR_MONTHLY_LINK
      } else if (
        this.selectedPeriod === 'monthly' &&
        this.selectedPlan === 'pro'
      ) {
        this.paymentLink = environment.subscriptionLinks.PRO_MONTHLY_LINK
      } else if (
        this.selectedPeriod === 'yearly' &&
        this.selectedPlan === 'creator'
      ) {
        this.paymentLink = environment.subscriptionLinks.CREATOR_YEARLY_LINK
      } else if (
        this.selectedPeriod === 'yearly' &&
        this.selectedPlan === 'pro'
      ) {
        this.paymentLink = environment.subscriptionLinks.PRO_YEARLY_LINK
      } else {
        throw new Error('Cant get an according plan')
      }
    }
  }

  async signUpNewUser(
    event: Event,
    email: FormControl,
    password: FormControl,
    username: FormControl
  ) {
    event.preventDefault()
    if (email.invalid || password.invalid) return

    this.waitingForSignUp = true

    const { data: registered_data, error: registered_error } =
      await this.db.supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: 'https://textandplay.com/dashboard',
          data: {
            user_name: username.value,
          },
        },
      })

    if (registered_error) return console.error(registered_error)
    console.log('user registered', registered_data)

    if (this.subscribing) {
      window.open(this.paymentLink + '?prefilled_email=' + email.value)
    }

    this.waitingForSignUp = false
    this.checkMail = true
  }

  async signInWithGoogle() {
    localStorage.setItem('oauth', '1')
    this.db.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: this.subscribing
          ? this.paymentLink
          : 'https://textandplay.com/dashboard',
      },
    })
  }

  async signInWithEmail(
    event: Event,
    email: FormControl,
    password: FormControl
  ) {
    event.preventDefault()
    if (email.invalid || password.invalid) return

    const { data, error } = await this.db.supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      // TODO - Supabase is not giving the error code, so we have to check the message by now.
      // https://github.com/supabase/auth/issues/1631
      if (error.message === 'Email not confirmed') {
        console.log('Email not confirmed')
        this.mailNotConfirmed = true
      }
      return console.error(error)
    }

    if (this.subscribing) {
      window.open(this.paymentLink + '?prefilled_email=' + email.value)
    } else {
      this.router.navigate(['/dashboard'])
    }
  }

  goToRegister() {
    this.mode = 'register'
  }
  goToLogin() {
    this.mode = 'login'
  }
}
