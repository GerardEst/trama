import { Injectable, WritableSignal, effect, signal } from '@angular/core'
import { condition, property, stat } from 'src/app/core/interfaces/interfaces'

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  playerProperties: WritableSignal<property> = signal({})
  playerStats: WritableSignal<stat[]> = signal([])
  playerConditions: WritableSignal<condition[]> = signal([])

  constructor() {}
}
