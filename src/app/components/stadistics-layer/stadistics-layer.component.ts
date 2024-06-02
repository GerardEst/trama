import { Component } from '@angular/core'
import { DatabaseService } from 'src/app/services/database.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'

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
    private db: DatabaseService,
    private story: ActiveStoryService
  ) {}

  async ngOnInit() {
    this.games = await this.db.getStadisticsOfTree(this.story.storyId(), true)

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
