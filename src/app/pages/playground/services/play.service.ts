import {
  Injectable,
  WritableSignal,
  Signal,
  computed,
  effect,
  signal,
} from '@angular/core'
import { node } from 'src/app/interfaces'

@Injectable({
  providedIn: 'root',
})
export class PlayService {
  story: WritableSignal<any> = signal(undefined)
  player: WritableSignal<any> = signal({ stats: [], conditions: [] })

  nodes: Signal<node[]> = computed(() => this.story()?.tree.nodes)
  refs: Signal<any> = computed(() => this.story()?.tree.refs)

  reset: WritableSignal<boolean> = signal(false)

  constructor() {
    effect(() => {
      console.log('Player updated', this.player())
    })
    effect(() => {
      console.log('Story updated', this.story())
    })
  }

  resetPlay() {
    // Get the story from localstorage
    this.story.set({
      ...this.story,
      //@ts-ignore
      tree: JSON.parse(localStorage.getItem('polo-tree')),
    })
    this.player.set({ stats: [], conditions: [] })
    this.reset.set(true)
  }
}
