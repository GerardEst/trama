import { Injectable } from '@angular/core'
import { DatabaseService } from './database.service'

@Injectable({
  providedIn: 'root',
})
export class StadisticsService {
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
