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

  constructor() {
    effect(() => {
      console.log('Player updated', this.player())
    })
    effect(() => {
      console.log('Story updated', this.story())
    })
  }
}
