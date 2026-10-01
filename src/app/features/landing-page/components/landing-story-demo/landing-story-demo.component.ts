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
  demoCompleted = false

  constructor(private activeStory: ActiveStoryService) {}

  ngOnInit() {
    this.activeStory.load('', 'Trama', exampleStory)
  }

  restartDemo() {
    this.demoCompleted = false
    this.showDemo = false
    setTimeout(() => (this.showDemo = true), 0)
  }
}
