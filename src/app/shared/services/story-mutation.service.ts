import { Injectable } from '@angular/core'
import { tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from './active-story.service'

@Injectable({
  providedIn: 'root',
})
export class StoryMutationService {
  private readonly pendingSaves = new Map<string, tree>()
  private saveInProgress = false

  constructor(
    private activeStory: ActiveStoryService,
    private database: DatabaseService
  ) {}

  update(mutate: (draft: tree) => boolean | void): boolean {
    const nextTree = this.activeStory.updateTree(mutate)
    if (!nextTree) return false

    this.enqueueSave(nextTree)
    return true
  }

  private enqueueSave(storyTree: tree) {
    const storyId = this.activeStory.storyId()
    if (!storyId) return

    this.pendingSaves.set(storyId, storyTree)
    if (!this.saveInProgress) void this.drainSaveQueue()
  }

  private async drainSaveQueue() {
    this.saveInProgress = true

    while (this.pendingSaves.size > 0) {
      const nextSave = this.pendingSaves.entries().next().value
      if (!nextSave) break

      const [storyId, storyTree] = nextSave
      this.pendingSaves.delete(storyId)

      try {
        const saved = await this.database.saveTreeToDB(storyId, storyTree)
        if (!saved) console.error('Could not save the active story')
      } catch (error: unknown) {
        console.error('Could not save the active story', error)
      }
    }

    this.saveInProgress = false
  }
}
