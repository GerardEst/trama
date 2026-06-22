import { Injectable, WritableSignal, signal } from '@angular/core'
import { condition, property, stat } from 'src/app/core/interfaces/interfaces'

/**
 * Holds the player's runtime state for the active playthrough: free-text
 * properties, stats and conditions. The logic that reads and mutates this
 * state lives in GameEngineService.
 */
@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  playerProperties: WritableSignal<property> = signal({})
  playerStats: WritableSignal<stat[]> = signal([])
  playerConditions: WritableSignal<condition[]> = signal([])
}
