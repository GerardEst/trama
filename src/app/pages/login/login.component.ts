import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
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
  @Input() mode?: string
  @Input() plan?: string

  constructor(
    private db: DatabaseService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    // // Remove indicator that user is coming from oauth login
    // localStorage.removeItem('oauth')
  }

  login_email = new FormControl('', [Validators.required, Validators.email])
  login_password = new FormControl('', Validators.required)
  register_email = new FormControl('', [Validators.required, Validators.email])
  register_password = new FormControl('', Validators.required)
  register_username = new FormControl('', Validators.required)
  checkMail: boolean = false

  // TODO - En cas de registre amb google, google redirigeix a dashboard després de registrar-se, però
  // en aquet cas hauria de redirigir a pagar

  async signUpNewUser(
    event: Event,
    email: FormControl,
    password: FormControl,
    username: FormControl
  ) {
    event.preventDefault()
    if (email.invalid || password.invalid) return

    const { data: registered_data, error: registered_error } =
      await this.db.supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            user_name: username.value,
          },
        },
      })

    if (registered_error) return console.error(registered_error)
    console.log('user registered', registered_data)

    if (this.plan === 'pro') {
      window.open(
        'https://buy.stripe.com/fZe8wR01e3vW1t6bIM?prefilled_email=' +
          email.value
      )
    }

    this.checkMail = true
  }

  async signInWithGoogle() {
    localStorage.setItem('oauth', '1')
    this.db.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          this.plan === 'pro'
            ? 'https://buy.stripe.com/fZe8wR01e3vW1t6bIM'
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

    if (error) return console.error(error)

    if (this.plan === 'pro') {
      window.open(
        'https://buy.stripe.com/fZe8wR01e3vW1t6bIM?prefilled_email=' +
          email.value
      )
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
