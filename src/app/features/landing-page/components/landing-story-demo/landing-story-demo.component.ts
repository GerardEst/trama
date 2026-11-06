import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { createGame, Game } from '@trama-app/engine'
import { tree } from 'src/app/core/interfaces/interfaces'
import { StoryPlayerComponent } from 'src/app/features/playground/components/story-player/story-player.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { buildExampleStory, EXAMPLE_STORY_COPY } from '../../exampleStory'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-landing-story-demo',
  standalone: true,
  imports: [StoryPlayerComponent, TranslatePipe],
  // A local store gives the shared player views a title and default settings.
  providers: [ActiveStoryService],
  templateUrl: './landing-story-demo.component.html',
  styleUrl: './landing-story-demo.component.css',
})
export class LandingStoryDemoComponent implements OnInit, OnDestroy {
  @Input() creationUrl = '/login?mode=register'
  @Input() loggedUserEmail?: string

  showDemo = true
  demoStarted = false
  demoCompleted = false
  game?: Game
  private storyTree?: Partial<tree>
  private unsubscribe?: () => void

  constructor(
    private activeStory: ActiveStoryService,
    private i18n: I18nService
  ) {}

  // The landing page has one URL per language, so the demo is rebuilt on each switch.
  ngOnInit() {
    const copy = this.i18n.pick(EXAMPLE_STORY_COPY)
    this.storyTree = buildExampleStory(copy)
    this.activeStory.load('', copy.title, this.storyTree)
    this.newGame()
  }

  ngOnDestroy() {
    this.unsubscribe?.()
  }

  restartDemo() {
    this.demoStarted = false
    this.demoCompleted = false
    this.showDemo = false
    this.newGame()
    setTimeout(() => (this.showDemo = true), 0)
  }

  private newGame() {
    this.unsubscribe?.()
    const game = createGame(this.storyTree ?? {})
    this.unsubscribe = game.subscribe(event => {
      if (event.type === 'answer') this.demoStarted = true
      else if (event.type === 'end') this.demoCompleted = true
    })
    this.game = game
  }
}
