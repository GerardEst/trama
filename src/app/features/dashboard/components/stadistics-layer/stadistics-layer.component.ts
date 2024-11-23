import { Component } from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from '../../../../shared/components/ui/basic-button/basic-button.component'
import { StadisticsService } from 'src/app/shared/services/stadistics.service'

@Component({
  selector: 'polo-stadistics-layer',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './stadistics-layer.component.html',
  styleUrl: './stadistics-layer.component.sass',
})
export class StadisticsLayerComponent {
  games?: any

  constructor(
    private story: ActiveStoryService,
    private stadistics: StadisticsService
  ) {}

  async ngOnInit() {
    this.games = await this.stadistics.getGamesOf(this.story.storyId())

    console.log(this.games)
  }

  toggleGame(game: any) {
    console.log(game)
    for (let step of game.path) {
      if (step.type === 'node') {
        document.querySelector('#' + step.id)?.classList.add('highlighted')
      }
      if (step.type === 'answer') {
        document.querySelector('#' + step.id)?.classList.add('highlighted')
      }
    }
  }

  showGameData(game: any) {
    console.log('open a modal with all the data about the game')
  }
}
