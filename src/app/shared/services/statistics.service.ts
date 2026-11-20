import { Injectable } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  games?: any
  /** The story the cached games belong to: the board keeps this service while the story changes. */
  private gamesOf?: string

  constructor(private db: DatabaseService) {}

  async getGamesOf(storyId: string) {
    if (this.games && this.gamesOf === storyId) return this.games
    const games = await this.db.getStadisticsOfTree(storyId, true)
    if (games) {
      this.games = games
      this.gamesOf = storyId
    }
    return games
  }

  clean() {
    this.games = null
    this.gamesOf = undefined
  }
}
