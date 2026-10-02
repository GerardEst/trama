import { Component } from '@angular/core'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ModalWindowComponent } from 'src/app/shared/components/ui/modal-window/modal-window.component'
import { PRICING } from 'src/app/core/constants'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-creator-paywall',
  standalone: true,
  imports: [ModalWindowComponent, BasicButtonComponent, TranslatePipe],
  templateUrl: './creator-paywall.component.html',
  styleUrl: './creator-paywall.component.sass',
})
export class CreatorPaywallComponent {
  creatorPrice = PRICING.CREATOR_MONTHLY_PRICE
}
