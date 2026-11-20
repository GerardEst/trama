import { Injectable, inject } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from './active-story.service'
import { StoryMutationService } from './story-mutation.service'

/**
 * Opens a story the way the editor does, so the editor's own controls (its options, its sharing)
 * work on it outside the board: in the story's pages, or in a dialog over the dashboard.
 */
@Injectable({ providedIn: 'root' })
export class StoryOpenerService {
  private readonly db = inject(DatabaseService)
  private readonly activeStory = inject(ActiveStoryService)
  private readonly mutations = inject(StoryMutationService)

  /**
   * False when the story does not exist or is not the author's. `stillWanted` lets a caller that
   * asked again meanwhile drop an older answer, so it never replaces the story asked for last.
   */
  async open(storyId: string, stillWanted: () => boolean = () => true): Promise<boolean> {
    // Coming from the editor, the story is already open, maybe with changes still being saved.
    if (this.activeStory.storyId() === storyId && !this.mutations.isDraft(storyId)) return true
    const story = await this.db.getStoryWithID(storyId)
    if (!stillWanted()) return false
    if (!story) return false
    this.mutations.loadStory(story.id, story.name, story.tree)
    this.activeStory.patchConfiguration({
      customId: story.custom_id,
      tracking: story.tracking,
      sharing: story.sharing,
      tapLink: story.tapLink,
      footer: story.footer,
      cumulativeMode: story.cumulativeMode,
    })
    return true
  }
}
