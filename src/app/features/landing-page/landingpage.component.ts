import { Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/features/board/board.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { GameComponent } from 'src/app/features/playground/components/game/game.component'
import { Title, Meta } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { exampleStory } from './exampleStory'
import { LandingCardComponent } from './components/landing-card/landing-card.component'
import { LandingLinkComponent } from '../../shared/components/link/landing-link.component'
import { LandingMobileComponent } from './components/landing-mobile/landing-mobile.component'
import { PricingComponent } from 'src/app/shared/components/pricing/pricing.component'
import { BillingCycleComponent } from 'src/app/shared/components/billing-cycle/billing-cycle.component'

import { trigger, style, animate, transition } from '@angular/animations'
import { BasicButtonComponent } from '../../shared/components/ui/basic-button/basic-button.component'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    BoardComponent,
    LandingMobileComponent,
    LandingLinkComponent,
    LandingCardComponent,
    GameComponent,
    FormsModule,
    BasicButtonComponent,
    PricingComponent,
    BillingCycleComponent,
  ],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.sass',
  animations: [
    trigger('showUseCase', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms 500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms 0ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class LandingpageComponent {
  @ViewChild('board') board?: BoardComponent
  @ViewChild('examplesSection') examples?: any
  @ViewChild('pricingSection') pricing?: any
  @ViewChild('activeExample') activeExample?: any

  baseRoute = environment.baseRoute
  exampleTree: any = exampleStory

  checkedLoggedUser: boolean = false
  loggedUserEmail?: string
  loggedUserPlan?: string
  showEditor: boolean = false
  activeUseCase: 'brands' | 'schools' | 'creatives' = 'brands'

  payAnnually: boolean = false

  constructor(
    private activeStory: ActiveStoryService,
    private titleService: Title,
    private meta: Meta,
    public db: DatabaseService
  ) {
    document.addEventListener('click', this.startVideo)
    document.addEventListener('scroll', this.startVideo)
  }

  startVideo() {
    const video = document.querySelector('video')
    if (!video) return

    video.play().catch(function (error) {
      console.log('Video play failed:', error)
    })
  }

  ngOnInit() {
    this.titleService.setTitle('Trama')
    this.meta.addTags([
      {
        name: 'description',
        content:
          'Easily create interactive stories and tests, share them and analyze the results',
      },
    ])
  }

  ngAfterViewInit() {
    this.checkLoggedUser()

    // Initializes the example tree
    this.activeStory.entireTree.set(this.exampleTree)
    this.board?.centerToNode(this.activeStory.entireTree().nodes[1])
    setTimeout(() => this.activeStory.activateTreeChangeEffects(), 0)
  }

  selectUseCase(useCase: 'brands' | 'schools' | 'creatives') {
    this.activeUseCase = useCase
  }

  async checkLoggedUser() {
    const loggedUser = await this.db.getUser()
    this.checkedLoggedUser = true

    if (!loggedUser) return

    this.loggedUserEmail = loggedUser.email
    this.loggedUserPlan =
      (loggedUser.profile.subscription_status === 'active' &&
        loggedUser.profile.plan) ||
      'free'
  }

  scrollTo(sectionId: string) {
    if (sectionId === 'examples') {
      if (!this.examples) return

      this.examples.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else if (sectionId === 'pricing') {
      console.log(sectionId)
      if (!this.pricing) return

      console.log(sectionId)
      this.pricing.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else if (sectionId === 'activeExample') {
      if (!this.activeExample) return

      this.activeExample.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }
}
