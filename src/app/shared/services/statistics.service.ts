import { Injectable } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  games?: any

  constructor(private db: DatabaseService) {}

  async getGamesOf(storyId: string) {
    this.games ||= await this.db.getStadisticsOfTree(storyId, true)

    return this.games
  }

  clean() {
    this.games = null
  }
}
