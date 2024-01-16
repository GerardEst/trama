import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'

@Component({
  selector: 'polo-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent {
  constructor(private db: DatabaseService) {}

  login_email = new FormControl('', [Validators.required, Validators.email])
  login_password = new FormControl('', Validators.required)
  register_email = new FormControl('', [Validators.required, Validators.email])
  register_password = new FormControl('', Validators.required)

  async signUpNewUser(event: Event, email: FormControl, password: FormControl) {
    event.preventDefault()
    if (email.invalid || password.invalid) return

    const { data: registered_data, error: registered_error } =
      await this.db.supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: 'localhost:4200',
        },
      })

    if (registered_error) return console.error(registered_error)
    console.log('user registered', registered_data)

    const userUuid = registered_data.user.id
    const userEmail = registered_data.user.email

    const { data: loged_data, error: loged_error } = await this.db.supabase
      .from('users')
      .insert([{ user_uuid: userUuid, name: '', email: userEmail }])
      .select()

    if (loged_error) return console.error(loged_error)
    console.log('user created', loged_data)
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
    console.log('user loged', data)
  }
}
