import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { AuthService } from 'src/app/core/services/auth.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

/** Who the person is to Trama: how they sign in, their password and their session. */
@Component({
  selector: 'polo-settings-account',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './account.component.html',
  styleUrl: '../../../../shared/layout/page.css',
})
export class AccountComponent {
  constructor(
    public db: DatabaseService,
    private router: Router,
    private authService: AuthService
  ) {}

  get name(): string {
    const user = this.db.user()
    return user?.user_metadata?.['user_name'] || user?.profile?.user_name || ''
  }

  /** The service the person signs in with, such as Google, as its name is written. */
  get providerName(): string {
    const provider = String(this.db.user()?.app_metadata?.provider ?? '')
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  changePassword() {
    this.router.navigate(['change-password'])
  }

  logout() {
    this.authService.logoutUser()
    this.router.navigate(['/login'])
  }
}
