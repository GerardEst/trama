import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { DatabaseService } from 'src/app/services/database.service'

@Component({
  selector: 'polo-change-password',
  standalone: true,
  imports: [
    BasicButtonComponent,
    SeparatorComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.sass',
})
export class ChangePasswordComponent {
  constructor(private db: DatabaseService, private router: Router) {}

  newPasswordForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8), // Mínimo de 8 caracteres
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
  })

  success: boolean = false
  feedback: string | null = null
  feedbackMessages = {
    success: 'Your password was successfuly changed',
    error: 'It was not possible to update your password. Try again later.',
    notEqualPasswords: 'The password and repeated password must be the same',
  }

  async onSubmit() {
    const { password, confirmPassword } = this.newPasswordForm.value
    if (password !== confirmPassword) {
      this.feedback = this.feedbackMessages.notEqualPasswords
      return
    }

    const passwordChanged = await this.db.supabase.auth.updateUser({ password })
    console.log(passwordChanged)
    if (passwordChanged.error) {
      this.feedback = this.feedbackMessages.error
      return
    }
    this.feedback = this.feedbackMessages.success
    this.success = true
  }
}
