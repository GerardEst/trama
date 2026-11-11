import { Injectable, signal } from '@angular/core'
import { tree } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

/**
 * The board's persistence, without a database: edits change the in-memory story
 * and its undo history, and nothing is ever saved. Same method names as
 * StoryMutationService, which it replaces inside a demo.
 */
@Injectable()
export class EmbedStoryMutationService {
  readonly saveState = signal<'idle'>('idle').asReadonly()
  readonly hasUnsavedChanges = signal(false).asReadonly()
  readonly recoveredDraft = signal(false).asReadonly()
  readonly savedDraft = signal<undefined>(undefined).asReadonly()

  constructor(private activeStory: ActiveStoryService) {}

  loadStory(storyId: string, name: string, storyTree: Partial<tree>) {
    this.activeStory.load(storyId, name, storyTree)
  }
  loadDraft(storyId: string, name: string, storyTree: Partial<tree>) {
    this.loadStory(storyId, name, storyTree)
  }
  isDraft() {
    return false
  }
  renameDraft() {}
  ensureSaved() {
    return Promise.resolve(true)
  }
  update(mutate: (draft: tree) => boolean | void, coalescingKey?: string): boolean {
    return Boolean(this.activeStory.updateTree(mutate, coalescingKey))
  }
  beginHistorySession() {
    this.activeStory.beginHistorySession()
  }
  endHistorySession() {
    this.activeStory.endHistorySession()
  }
  batch<T>(action: () => T): T {
    return this.activeStory.groupTreeChanges(action)
  }
  undo() {
    return Boolean(this.activeStory.undoTree())
  }
  redo() {
    return Boolean(this.activeStory.redoTree())
  }
  retry() {}
}

/** Images need an account and storage: a demo neither uploads nor deletes them. */
@Injectable()
export class EmbedStoryImagesService {
  claimUpload() {
    return false
  }
  cancelNodeUploads() {}
  storyLoaded() {}
  saveQueued() {}
  saveFinished() {}
  historyReleased() {}
  retireImage() {}
  cleanup() {}
  async uploadForNode() {
    return { status: 'optimization-failed' as const }
  }
}

/** A signed-out visitor: no session, no network. */
@Injectable()
export class EmbedDatabaseService {
  readonly user = signal(undefined).asReadonly()
  readonly supabase = {
    auth: { getUser: async () => ({ data: { user: null } }) },
  }
  async saveTreeToDB() {
    return { error: null }
  }
}
