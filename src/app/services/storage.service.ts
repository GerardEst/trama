import { Injectable } from '@angular/core'
import { PlayService } from '../pages/playground/services/play.service'

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private playService: PlayService) {}

  private updateStoredTree(newTree: any) {
    // localStorage.setItem('polo-tree', JSON.stringify(newTree))
    // Slowly moving to activeStory tree?? From now, use both. I will decide
    // this.activeStory.entireTree = newTree

    this.playService.resetPlay()
  }
  private createNewTree() {
    const newTree = {
      nodes: [{ id: 'node_0', text: 'Start' }],
    }
    return JSON.stringify(newTree)
  }
}
