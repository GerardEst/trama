import { Component } from '@angular/core'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { ModalWindowComponent } from 'src/app/components/ui/modal-window/modal-window.component'
import { DatabaseService } from 'src/app/services/database.service'
import { PRICING } from 'src/app/constants'

@Component({
  selector: 'polo-creator-paywall',
  standalone: true,
  imports: [ModalWindowComponent, BasicButtonComponent],
  templateUrl: './creator-paywall.component.html',
  styleUrl: './creator-paywall.component.sass',
})
export class CreatorPaywallComponent {
  cancelButtonText = 'Cancel plan'
  creatorPrice = PRICING.CREATOR_MONTHLY_PRICE

  constructor(public db: DatabaseService) {}

  upgradePlan() {
    window.open(
      'https://buy.stripe.com/fZe8wR01e3vW1t6bIM?prefilled_email=' +
        this.db.user().email
    )
  }
}
