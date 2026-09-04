import { Injectable } from '@angular/core'
import { tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from './active-story.service'

@Injectable({
  providedIn: 'root',
})
export class StoryMutationService {
  private saveQueue: Promise<void> = Promise.resolve()

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

    this.saveQueue = this.saveQueue
      .then(async () => {
        const saved = await this.database.saveTreeToDB(storyId, storyTree)
        if (!saved) console.error('Could not save the active story')
      })
      .catch((error: unknown) => {
        console.error('Could not save the active story', error)
      })
  }
}
