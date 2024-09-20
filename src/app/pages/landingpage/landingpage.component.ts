import { Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { Router } from '@angular/router'
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

import { trigger, style, animate, transition } from '@angular/animations'

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
  loggedUser: boolean = false
  showEditor: boolean = false
  activeUseCase: 'brands' | 'schools' | 'creatives' = 'brands'
  payYearly: boolean = false

  constructor(
    private activeStory: ActiveStoryService,
    private titleService: Title,
    private meta: Meta,
    public router: Router,
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
    const loggedUser = await this.db.supabase.auth.getUser()

    this.loggedUser = !!loggedUser?.data?.user?.id
    this.checkedLoggedUser = true
  }

  usePro() {
    // Inactivated for now
    return
    this.loggedUser
      ? this.router.navigate(['dashboard'])
      : this.router.navigate(['login'], {
          queryParams: { mode: 'register', plan: 'pro' },
        })
  }
}
