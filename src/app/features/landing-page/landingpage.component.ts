import { Component, OnInit } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'
import { Title, Meta } from '@angular/platform-browser'
import { LandingStoryDemoComponent } from './components/landing-story-demo/landing-story-demo.component'
import { PricingComponent } from 'src/app/shared/components/pricing/pricing.component'
import { BillingCycleComponent } from 'src/app/shared/components/billing-cycle/billing-cycle.component'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    LandingStoryDemoComponent,
    PricingComponent,
    BillingCycleComponent,
  ],
  templateUrl: './landingpage.component.html',
  styleUrls: [
    './landingpage.component.sass',
    './landingpage-conversion.sass',
  ],
})
export class LandingpageComponent implements OnInit {
  loggedUserEmail?: string
  loggedUserPlan?: string
  payAnnually = false

  get creationUrl() {
    return this.loggedUserEmail ? '/dashboard' : '/login?mode=register'
  }

  constructor(
    private titleService: Title,
    private meta: Meta,
    public db: DatabaseService
  ) {}

  ngOnInit() {
    this.checkLoggedUser()
    this.titleService.setTitle('Trama — Tell stories readers can step inside')
    this.meta.updateTag({
      name: 'description',
      content:
        'Tell the story only you can tell. Create interactive stories where readers make choices that matter, then invite them in with a simple link.',
    })
  }

  async checkLoggedUser() {
    const loggedUser = await this.db.getUser()
    if (!loggedUser) return

    this.loggedUserEmail = loggedUser.email
    this.loggedUserPlan =
      (loggedUser.profile.subscription_status === 'active' &&
        loggedUser.profile.plan) ||
      'free'
  }
}
