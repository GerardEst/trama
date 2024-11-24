import { Component } from '@angular/core'
import { ModalWindowComponent } from '../../../../shared/components/ui/modal-window/modal-window.component'
import { BasicButtonComponent } from '../../../../shared/components/ui/basic-button/basic-button.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StatisticsService } from 'src/app/shared/services/statistics.service'
import { Router } from '@angular/router'
import { PricingComponent } from 'src/app/shared/components/pricing/pricing.component'
import { BillingCycleComponent } from 'src/app/shared/components/billing-cycle/billing-cycle.component'
import { SeparatorComponent } from '../../../../shared/components/ui/separator/separator.component'

@Component({
  selector: 'polo-profile-modal',
  standalone: true,
  imports: [
    ModalWindowComponent,
    BasicButtonComponent,
    PricingComponent,
    BillingCycleComponent,
    SeparatorComponent,
  ],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.sass',
})
export class ProfileModalComponent {
  payAnnually: boolean = false

  constructor(
    public db: DatabaseService,
    private activeStory: ActiveStoryService,
    private stadistics: StatisticsService,
    private router: Router
  ) {}

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
