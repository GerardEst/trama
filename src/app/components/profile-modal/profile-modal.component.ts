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
    console.log('try to cancel subscription for user ', this.db.user())

    fetch(
      'https://lsemostpqoguehpsbzgu.supabase.co/functions/v1/cancel-subscription',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
        body: JSON.stringify({
          subscription_id: this.db.user().profile.subscription_id,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Subscription canceled successfully') {
          alert('Your subscription has been canceled.')
          // Optionally update the UI to reflect the cancellation
        } else {
          alert('Failed to cancel subscription')
        }
      })
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
