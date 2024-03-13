import { Injectable, WritableSignal, effect, signal } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class PlayService {
  story: any = undefined
  player: WritableSignal<any> = signal({ stats: [], conditions: [] })

  constructor() {
    effect(() => {
      console.log('Player updated', this.player())
    })
  }
}
