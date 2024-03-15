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
  /** Quan s'actualitza el localstorage, es fantastic i tal però ara necessito
   * que s'actualitzi el flow de polo-flow.
   * Per fer-ho, podria agafar la funcio updateStoredTree de storage.service
   * Pero tinc la historia a play.service, així que crec que és millor fer-ho
   * des d'aquí.
   *
   * Pero aixo vol dir que quan modifico algo, he de cambiar el play service en contes
   * de fer-ho directament a storage.service
   */
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
