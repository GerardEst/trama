import { Component } from '@angular/core'
import { ModalWindowComponent } from '../ui/modal-window/modal-window.component'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'
import { DatabaseService } from 'src/app/services/database.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { StadisticsService } from 'src/app/services/stadistics.service'
import { Router } from '@angular/router'

@Component({
  selector: 'polo-profile-modal',
  standalone: true,
  imports: [ModalWindowComponent, BasicButtonComponent],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.sass',
})
export class ProfileModalComponent {
  cancelButtonText = 'Cancel plan'

  constructor(
    public db: DatabaseService,
    private activeStory: ActiveStoryService,
    private stadistics: StadisticsService,
    private router: Router
  ) {}

  upgradePlan() {
    window.open(
      'https://buy.stripe.com/fZe8wR01e3vW1t6bIM?prefilled_email=' +
        this.db.user().email
    )
  }

  cancelPlan() {
    const jwtToken = localStorage.getItem('sb-lsemostpqoguehpsbzgu-auth-token')
    if (!jwtToken) {
      return console.error('No present JWT. Cant cancel plan.')
    }

    this.cancelButtonText = 'Unsubscribing'
    fetch(
      'https://lsemostpqoguehpsbzgu.supabase.co/functions/v1/cancel-subscription-request',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(jwtToken).access_token}`,
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          this.db.user().profile.subscription_status = 'canceled'
        } else {
          alert('Failed to cancel subscription')
        }
      })
      .catch((error) => {
        console.error(error)
        alert('Failed to cancel subscription')
      })
  }

  changePassword() {
    this.router.navigate(['change-password'])
  }

  logout() {
    this.db.supabase.auth.signOut()
    this.db.user.set(null)
    this.activeStory.reset()
    this.stadistics.clean()
    localStorage.removeItem('polo-id')
    localStorage.removeItem('polo-activeNodes')

    this.router.navigate(['/login'])
  }
}
