import { Component } from '@angular/core'
import { BillingSettingsComponent } from 'src/app/shared/components/billing-settings/billing-settings.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

/** The same plan and subscription settings as the board's account modal, as a page of the person's settings. */
@Component({
  selector: 'polo-settings-billing',
  standalone: true,
  imports: [BillingSettingsComponent, TranslatePipe],
  templateUrl: './billing.component.html',
  styleUrl: '../../../../shared/layout/page.css',
})
export class BillingComponent {}
