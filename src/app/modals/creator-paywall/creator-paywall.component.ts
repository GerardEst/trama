import { Component } from '@angular/core'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { ModalWindowComponent } from 'src/app/components/ui/modal-window/modal-window.component'
import { PRICING } from 'src/app/constants'

@Component({
  selector: 'polo-creator-paywall',
  standalone: true,
  imports: [ModalWindowComponent, BasicButtonComponent],
  templateUrl: './creator-paywall.component.html',
  styleUrl: './creator-paywall.component.sass',
})
export class CreatorPaywallComponent {
  creatorPrice = PRICING.CREATOR_MONTHLY_PRICE
}
