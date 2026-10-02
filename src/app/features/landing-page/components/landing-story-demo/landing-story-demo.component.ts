import { Component, Input, OnInit } from '@angular/core'
import { GameComponent } from 'src/app/features/playground/components/game/game.component'
import { GameEngineService } from 'src/app/features/playground/services/game-engine.service'
import { PlayerService } from 'src/app/features/playground/services/player.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { exampleStory } from '../../exampleStory'

@Component({
  selector: 'polo-landing-story-demo',
  standalone: true,
  imports: [GameComponent],
  providers: [ActiveStoryService, GameEngineService, PlayerService],
  templateUrl: './landing-story-demo.component.html',
  styleUrl: './landing-story-demo.component.sass',
})
export class LandingStoryDemoComponent implements OnInit {
  @Input() creationUrl = '/login?mode=register'
  @Input() loggedUserEmail?: string

  showDemo = true
  demoStarted = false
  demoCompleted = false

  constructor(
    private activeStory: ActiveStoryService,
    private player: PlayerService
  ) {}

  ngOnInit() {
    this.activeStory.load('', 'The Last Threshold', exampleStory)
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
