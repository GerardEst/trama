import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
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
export class LandingpageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('closingSection') closingSection?: ElementRef<HTMLElement>

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
    this.titleService.setTitle('Trama — You write the story. They choose the way.')
    this.meta.updateTag({
      name: 'description',
      content:
        'You write the story. They choose the way. Build interactive stories on a visual canvas, share them with a single link, and see where your readers go.',
    })
  }

  private closingObserver?: IntersectionObserver

  ngAfterViewInit() {
    this.revealClosingOnScroll()
  }

  ngOnDestroy() {
    this.closingObserver?.disconnect()
  }

  // The section only starts hidden once we know it can be revealed, so it never stays invisible.
  revealClosingOnScroll() {
    const section = this.closingSection?.nativeElement
    if (!section || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    section.classList.add('closing-section--pending')
    this.closingObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        section.classList.replace('closing-section--pending', 'closing-section--revealed')
        this.closingObserver?.disconnect()
      },
      { threshold: 0.35 }
    )
    this.closingObserver.observe(section)
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
