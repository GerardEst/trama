import { Injectable, WritableSignal, effect, signal } from '@angular/core'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  player: WritableSignal<any> = signal({ stats: [], conditions: [] })

  constructor(public activeStory: ActiveStoryService) {
    effect(() => {
      console.log('Player updated', this.player())
    })
  }
}
