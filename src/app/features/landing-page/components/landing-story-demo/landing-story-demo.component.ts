import { Component, Input, OnInit } from '@angular/core'
import { GameComponent } from 'src/app/features/playground/components/game/game.component'
import { GameEngineService } from 'src/app/features/playground/services/game-engine.service'
import { PlayerService } from 'src/app/features/playground/services/player.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { buildExampleStory, EXAMPLE_STORY_COPY } from '../../exampleStory'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-landing-story-demo',
  standalone: true,
  imports: [GameComponent, TranslatePipe],
  providers: [ActiveStoryService, GameEngineService, PlayerService],
  templateUrl: './landing-story-demo.component.html',
  styleUrl: './landing-story-demo.component.css',
})
export class LandingStoryDemoComponent implements OnInit {
  @Input() creationUrl = '/login?mode=register'
  @Input() loggedUserEmail?: string

  showDemo = true
  demoStarted = false
  demoCompleted = false

  constructor(
    private activeStory: ActiveStoryService,
    private player: PlayerService,
    private i18n: I18nService
  ) {}

  // The landing page has one URL per language, so the demo is rebuilt on each switch.
  ngOnInit() {
    const copy = this.i18n.pick(EXAMPLE_STORY_COPY)
    this.activeStory.load('', copy.title, buildExampleStory(copy))
  }

  restartDemo() {
    this.demoStarted = false
    this.demoCompleted = false
    this.showDemo = false
    this.player.playerProperties.set({})
    this.player.playerStats.set([])
    this.player.playerConditions.set([])
    setTimeout(() => (this.showDemo = true), 0)
  }
}
