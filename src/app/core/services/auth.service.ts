import { DatabaseService } from './database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StatisticsService } from 'src/app/shared/services/statistics.service'
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private db: DatabaseService,
    private activeStory: ActiveStoryService,
    private stadistics: StatisticsService
  ) {}

  public logoutUser() {
    this.db.supabase.auth.signOut()
    this.db.user.set(null)

    this.activeStory.reset()
    this.stadistics.clean()
    localStorage.removeItem('polo-id')
    localStorage.removeItem('polo-activeNodes')
  }
}
