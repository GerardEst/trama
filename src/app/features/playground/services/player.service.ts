import { Injectable, WritableSignal, signal } from '@angular/core'
import { condition, property, stat } from 'src/app/core/interfaces/interfaces'

export interface PlayerSnapshot {
  properties: property
  stats: stat[]
  conditions: condition[]
}

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

  snapshot(): PlayerSnapshot {
    return structuredClone({
      properties: this.playerProperties(),
      stats: this.playerStats(),
      conditions: this.playerConditions(),
    })
  }

  restore(snapshot: PlayerSnapshot) {
    const copy = structuredClone(snapshot)
    this.playerProperties.set(copy.properties)
    this.playerStats.set(copy.stats)
    this.playerConditions.set(copy.conditions)
  }

  reset() {
    this.restore({ properties: {}, stats: [], conditions: [] })
  }
}
