import { Injectable } from '@angular/core'

const ACTIVE_NODES_STORAGE_KEY = 'polo-activeNodes'

@Injectable({
  providedIn: 'root',
})
export class BoardPreferencesService {
  setActiveNode(storyId: string, nodeId: string) {
    const activeNodes = this.readActiveNodes()
    activeNodes[storyId] = nodeId
    localStorage.setItem(ACTIVE_NODES_STORAGE_KEY, JSON.stringify(activeNodes))
  }

  getActiveNode(storyId: string) {
    return this.readActiveNodes()[storyId]
  }

  private readActiveNodes(): Record<string, string> {
    const storedActiveNodes = localStorage.getItem(ACTIVE_NODES_STORAGE_KEY)
    if (!storedActiveNodes) return {}

    try {
      const value: unknown = JSON.parse(storedActiveNodes)
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

      return Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
      )
    } catch {
      return {}
    }
  }
}
