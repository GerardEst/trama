import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/core/services/database.service'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { SeparatorComponent } from 'src/app/shared/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'polo-reset-password',
  standalone: true,
  imports: [
    BasicButtonComponent,
    SeparatorComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.sass',
})
export class ResetPasswordComponent {
  constructor(private db: DatabaseService) {}

  feedbackMessages = {
    success: 'We have sent the link to your email',
    error: 'There was an error sending the link, try again later',
  }
  feedback: string | null = null
  email_address = new FormControl('', [Validators.required, Validators.email])

  async resetPasswordFor(event: Event, address: FormControl) {
    event.preventDefault()
    if (address.invalid) return

    const sentMessage = await this.db.supabase.auth.resetPasswordForEmail(
      address.value,
      {
        redirectTo: environment.baseRoute + '/change-password',
      }
    )

    if (!sentMessage.error) {
      this.feedback = this.feedbackMessages.success
      return
    } else {
      this.feedback = this.feedbackMessages.error
    }
  }
}
