import { computed, effect, EffectRef, Injectable, OnDestroy, signal, untracked } from '@angular/core'
import { tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from './active-story.service'

interface PendingSave {
  tree: tree
  userId?: string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

@Injectable({
  providedIn: 'root',
})
export class StoryMutationService implements OnDestroy {
  private readonly pendingSaves = new Map<string, PendingSave>()
  private readonly storyAuthors = new Map<string, string | undefined>()
  private readonly failedStories = new Set<string>()
  private readonly recoveredStories = new Set<string>()
  private saveInProgress = false
  private destroyed = false
  private retryTimer?: ReturnType<typeof setTimeout>
  private retryDelay = 2000
  private readonly sessionWatcher: EffectRef
  private readonly currentAuthor = computed(() => this.database.user?.()?.id)
  private readonly state = signal<SaveState>('idle')
  readonly saveState = this.state.asReadonly()
  private readonly recoveredState = signal(false)
  readonly recoveredDraft = this.recoveredState.asReadonly()
  readonly hasUnsavedChanges = computed(() =>
    this.saveState() === 'saving' || this.saveState() === 'error'
  )

  private readonly warnBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!this.hasUnsavedChanges()) return
    event.preventDefault()
    event.returnValue = ''
  }
  private readonly retryWhenOnline = () => {
    this.cancelRetry()
    void this.drainSaveQueue()
  }

  constructor(
    private activeStory: ActiveStoryService,
    private database: DatabaseService
  ) {
    window.addEventListener('beforeunload', this.warnBeforeUnload)
    window.addEventListener('online', this.retryWhenOnline)
    this.sessionWatcher = effect(() => {
      const userId = this.currentAuthor()
      untracked(() => {
        this.cancelRetry()
        if (userId) void this.drainSaveQueue()
      })
    }, { allowSignalWrites: true })
  }

  ngOnDestroy() {
    this.destroyed = true
    this.sessionWatcher.destroy()
    this.cancelRetry()
    window.removeEventListener('beforeunload', this.warnBeforeUnload)
    window.removeEventListener('online', this.retryWhenOnline)
  }

  /** Dashboard loads must not replace pending edits with an older server tree. */
  loadStory(storyId: string, name: string, serverTree: Partial<tree>) {
    const userId = this.database.user?.()?.id
    if (userId || !this.storyAuthors.has(storyId)) this.storyAuthors.set(storyId, userId)
    const pending = this.pendingSaves.get(storyId)
    const pendingTree = pending?.userId === userId ? pending?.tree : undefined
    const recoveredTree = pendingTree ? undefined : this.readDraft(storyId, userId)
    this.activeStory.load(storyId, name, pendingTree ?? recoveredTree ?? serverTree)

    if (recoveredTree) {
      this.pendingSaves.set(storyId, { tree: this.activeStory.entireTree(), userId })
      // Restoring is local only. Ask the author to retry rather than silently
      // overwriting edits that may have been made elsewhere since this draft.
      this.recoveredStories.add(storyId)
      this.failedStories.add(storyId)
      this.recoveredState.set(true)
      this.refreshState()
    }
  }

  update(mutate: (draft: tree) => boolean | void): boolean {
    const nextTree = this.activeStory.updateTree(mutate)
    if (!nextTree) return false

    this.enqueueSave(nextTree)
    return true
  }

  retry() {
    this.cancelRetry()
    this.retryDelay = 2000
    this.recoveredStories.clear()
    this.failedStories.clear()
    this.refreshState()
    void this.drainSaveQueue()
  }

  private enqueueSave(storyTree: tree) {
    const storyId = this.activeStory.storyId()
    if (!storyId) return

    // Keep the original author's scope when the session disappears mid-edit.
    // New signed-out edits must not become anonymous drafts or another user's.
    if (!this.storyAuthors.has(storyId)) this.storyAuthors.set(storyId, this.database.user?.()?.id)
    const userId = this.storyAuthors.get(storyId)
    this.pendingSaves.set(storyId, { tree: storyTree, userId })
    this.recoveredStories.delete(storyId)
    this.writeDraft(storyId, storyTree, userId)
    this.refreshState()
    this.cancelRetry()
    if (!this.saveInProgress) void this.drainSaveQueue()
  }

  private async drainSaveQueue() {
    if (this.saveInProgress || this.destroyed) return
    this.saveInProgress = true
    const failedThisAttempt = new Set<string>()

    try {
      while (!this.destroyed && this.pendingSaves.size > 0) {
        const nextSave = Array.from(this.pendingSaves.entries()).find(([id]) =>
          !failedThisAttempt.has(id) && !this.recoveredStories.has(id)
        )
        if (!nextSave) break

        const [storyId, pending] = nextSave
        if (pending.userId !== this.database.user?.()?.id) {
          // Pause, rather than drop, an author's writes on session loss or an
          // account switch. Continue backing up their latest edits locally.
          this.failedStories.add(storyId)
          failedThisAttempt.add(storyId)
          continue
        }

        let saved = false
        try {
          saved = await this.database.saveTreeToDB(storyId, pending.tree)
        } catch (error: unknown) {
          console.error('Could not save the story', error)
        }

        if (saved) {
          this.failedStories.delete(storyId)
          this.retryDelay = 2000
          // Acknowledging an older request must not clear newer queued edits
          // or their recovery copy (e.g. a batch of node deletions).
          if (this.pendingSaves.get(storyId) === pending) {
            this.pendingSaves.delete(storyId)
            this.removeDraft(storyId, pending.userId)
          }
        } else {
          this.failedStories.add(storyId)
          failedThisAttempt.add(storyId)
        }
        this.refreshState()
      }
    } finally {
      this.saveInProgress = false
      this.refreshState()
      const userId = this.database.user?.()?.id
      if (!this.destroyed && Array.from(this.pendingSaves.entries()).some(([id, pending]) =>
        !this.recoveredStories.has(id) && pending.userId === userId
      )) {
        this.retryTimer = setTimeout(() => {
          this.retryTimer = undefined
          void this.drainSaveQueue()
        }, this.retryDelay)
        this.retryDelay = Math.min(this.retryDelay * 2, 30000)
      }
    }
  }

  private refreshState() {
    if (this.failedStories.size > 0) this.state.set('error')
    else if (this.pendingSaves.size > 0) this.state.set('saving')
    else if (this.state() !== 'idle') {
      this.state.set('saved')
      this.recoveredState.set(false)
    }
  }

  private cancelRetry() {
    if (this.retryTimer !== undefined) clearTimeout(this.retryTimer)
    this.retryTimer = undefined
  }

  // Per-tab storage survives reloads without sharing stale drafts between
  // tabs. Only authenticated authors get a recovery copy, isolated by account.
  private draftKey(storyId: string, userId: string) {
    return `polo-pending-tree:${userId}:${storyId}`
  }

  private writeDraft(storyId: string, storyTree: tree, userId?: string) {
    if (!userId) return
    try {
      sessionStorage.setItem(this.draftKey(storyId, userId), JSON.stringify(storyTree))
    } catch {
      console.warn('Could not back up unsaved story changes in this tab')
    }
  }

  private readDraft(storyId: string, userId?: string): tree | undefined {
    if (!userId) return undefined
    try {
      const stored = sessionStorage.getItem(this.draftKey(storyId, userId))
      if (!stored) return undefined
      const draft: unknown = JSON.parse(stored)
      if (
        draft && typeof draft === 'object' &&
        'nodes' in draft && Array.isArray(draft.nodes) &&
        draft.nodes.every((node: unknown) => node !== null && typeof node === 'object' && 'id' in node && typeof node.id === 'string') &&
        'refs' in draft && draft.refs !== null && typeof draft.refs === 'object' && !Array.isArray(draft.refs) &&
        'categories' in draft && Array.isArray(draft.categories)
      ) return draft as tree
    } catch {
      console.warn('Could not read the unsaved story draft')
    }
    return undefined
  }

  private removeDraft(storyId: string, userId?: string) {
    if (!userId) return
    try {
      sessionStorage.removeItem(this.draftKey(storyId, userId))
    } catch {
      console.warn('Could not remove the saved story draft')
    }
  }
}
