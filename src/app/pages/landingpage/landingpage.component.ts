import { Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
//import { Router } from '@angular/router'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { DatabaseService } from 'src/app/services/database.service'
import * as Cronitor from '@cronitorio/cronitor-rum'
import { GameComponent } from 'src/app/components/game/game.component'
import { Title, Meta } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { exampleStory } from './exampleStory'
import { LandingCardComponent } from './components/landing-card/landing-card.component'
import { LandingButtonComponent } from './components/button/landing-button.component'
import { LandingMobileComponent } from './components/landing-mobile/landing-mobile.component'
import { PricingComponent } from 'src/app/components/pricing/pricing.component'
import { BillingCycleComponent } from 'src/app/components/billing-cycle/billing-cycle.component'

import { trigger, style, animate, transition } from '@angular/animations'
import { BasicButtonComponent } from '../../components/ui/basic-button/basic-button.component'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    BoardComponent,
    LandingMobileComponent,
    LandingButtonComponent,
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
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Text & Play')
    this.meta.addTags([
      {
        name: 'description',
        content:
          'Easily create interactive stories and tests, share them and analyze the results',
      },
    ])
  }

  ngAfterViewInit() {
    Cronitor.track('LandingpageView')

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
}
