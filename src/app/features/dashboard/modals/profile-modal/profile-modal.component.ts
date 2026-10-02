import { Component } from '@angular/core'
import { ModalWindowComponent } from '../../../../shared/components/ui/modal-window/modal-window.component'
import { BasicButtonComponent } from '../../../../shared/components/ui/basic-button/basic-button.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { Router } from '@angular/router'
import { PricingComponent } from 'src/app/shared/components/pricing/pricing.component'
import { BillingCycleComponent } from 'src/app/shared/components/billing-cycle/billing-cycle.component'
import { SeparatorComponent } from '../../../../shared/components/ui/separator/separator.component'
import { AuthService } from 'src/app/core/services/auth.service'
import { ThemeService } from 'src/app/shared/services/theme.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { LanguageSelectorComponent } from 'src/app/shared/components/ui/language-selector/language-selector.component'

@Component({
  selector: 'polo-profile-modal',
  standalone: true,
  imports: [
    ModalWindowComponent,
    BasicButtonComponent,
    PricingComponent,
    BillingCycleComponent,
    SeparatorComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.sass',
})
export class ProfileModalComponent {
  payAnnually: boolean = false

  constructor(
    public db: DatabaseService,
    private router: Router,
    private authService: AuthService,
    public theme: ThemeService,
    private i18n: I18nService
  ) {}

  paymentDate(date: string) {
    return this.i18n.formatDate(date, { dateStyle: 'long' })
  }

  changePassword() {
    this.router.navigate(['change-password'])
  }

  logout() {
    this.authService.logoutUser()

    this.router.navigate(['/login'])
  }
}
