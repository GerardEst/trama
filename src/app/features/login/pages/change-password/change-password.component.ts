import { Component, Input, computed, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/shared/components/ui/separator/separator.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { WordmarkComponent } from 'src/app/shared/components/wordmark/wordmark.component'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { siteUrl } from 'src/app/core/site-links'

@Component({
  selector: 'polo-change-password',
  standalone: true,
  imports: [
    WordmarkComponent,
    BasicButtonComponent,
    SeparatorComponent,
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: '../login-shared.css',
})
export class ChangePasswordComponent {
  private readonly i18n = inject(I18nService)
  readonly homeUrl = computed(() => siteUrl(this.i18n.lang()))

  constructor(
    private db: DatabaseService,
    private router: Router
  ) {}

  newPasswordForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8), // Mínimo de 8 caracteres
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
  })

  success: boolean = false
  feedback: TranslationKey | null = null
  feedbackMessages = {
    success: 'login.change.success',
    error: 'login.change.error',
    notEqualPasswords: 'login.change.notEqual',
  } as const

  async onSubmit() {
    const { password, confirmPassword } = this.newPasswordForm.value
    if (password !== confirmPassword) {
      this.feedback = this.feedbackMessages.notEqualPasswords
      return
    }

    const passwordChanged = await this.db.supabase.auth.updateUser({
      password: password ?? undefined,
    })
    console.log(passwordChanged)
    if (passwordChanged.error) {
      this.feedback = this.feedbackMessages.error
      return
    }
    this.feedback = this.feedbackMessages.success
    this.success = true
  }
}
