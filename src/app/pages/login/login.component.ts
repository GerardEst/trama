import { Component } from '@angular/core'
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
  constructor(
    private db: DatabaseService,
    private router: Router
  ) {}

  register = false

  login_email = new FormControl('', [Validators.required, Validators.email])
  login_password = new FormControl('', Validators.required)
  register_email = new FormControl('', [Validators.required, Validators.email])
  register_password = new FormControl('', Validators.required)
  register_username = new FormControl('', Validators.required)
  checkMail: boolean = false

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
          emailRedirectTo: 'https://polo-rust.vercel.app/dashboard',
          data: {
            user_name: username.value,
          },
        },
      })

    if (registered_error) return console.error(registered_error)
    console.log('user registered', registered_data)

    this.checkMail = true
  }

  async signInWithGoogle() {
    this.db.supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    localStorage.setItem('oauth', '1')
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

    this.router.navigate(['/dashboard'])
  }

  goToRegister() {
    this.register = true
  }
  goToLogin() {
    this.register = false
  }
}
