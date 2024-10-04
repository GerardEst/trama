import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { SeparatorComponent } from 'src/app/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
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

  email_address = new FormControl('', [Validators.required, Validators.email])

  async resetPasswordFor(event: Event, address: FormControl) {
    event.preventDefault()
    if (address.invalid) return

    const message = await this.db.supabase.auth.resetPasswordForEmail(
      address.value,
      {
        redirectTo: environment.baseRoute + '/change-password',
      }
    )

    console.log(message)
  }
}
