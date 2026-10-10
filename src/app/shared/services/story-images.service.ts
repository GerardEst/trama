import { Injectable } from '@angular/core'
import { tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from './active-story.service'

const IMAGE_OPTIMIZER_URL = 'https://kpxqjqny2xn6tz5xnf2fqe2u4a0ryvky.lambda-url.eu-west-2.on.aws/'

export interface UploadedStoryImage {
  status: 'uploaded'
  storyId: string
  nodeId: string
  userId: string
  requestId: number
  path: string
}

export type StoryImageUploadResult = UploadedStoryImage | {
  status: 'cancelled' | 'unauthenticated' | 'optimization-failed' | 'upload-failed'
}

interface UploadRequest {
  id: number
  storyId: string
  nodeId: string
  userId: string
  cancelled: boolean
  path?: string
}

interface StorySaveContext {
  userId?: string
  pending: boolean
}

interface RetiredImages {
  tree: tree
  userId?: string
  paths: Set<string>
}

/** Owns image files, not their references in the story JSON. */
@Injectable({ providedIn: 'root' })
export class StoryImagesService {
  private readonly saveContexts = new Map<string, StorySaveContext>()
  private readonly retiredImages = new Map<string, RetiredImages>()
  private readonly orphanedUploads = new Map<string, string>()
  private readonly removingImages = new Set<string>()
  private readonly uploads = new Map<string, UploadRequest>()
  private uploadSequence = 0

  constructor(
    private database: DatabaseService,
    private activeStory: ActiveStoryService
  ) {}

  async uploadForNode(nodeId: string, file: File): Promise<StoryImageUploadResult> {
    const userId = this.database.user?.()?.id
    if (!userId) return { status: 'unauthenticated' }
    const storyId = this.activeStory.storyId()
    this.cancelNodeUploads(storyId, nodeId)
    const request: UploadRequest = { id: ++this.uploadSequence, storyId, nodeId, userId, cancelled: false }
    const key = this.uploadKey(storyId, nodeId)
    this.uploads.set(key, request)
    let uploaded = false

    try {
      if (!this.isCurrentUpload(request)) return { status: 'cancelled' }
      const { data: { user }, error } = await this.database.supabase.auth.getUser()
      if (error || user?.id !== userId) return { status: 'unauthenticated' }
      if (!this.isCurrentUpload(request)) return { status: 'cancelled' }
      const blob = await this.optimizeImage(file)
      if (!this.isCurrentUpload(request)) return { status: 'cancelled' }
      if (!blob) return { status: 'optimization-failed' }
      const path = `${userId}/${storyId}/${nodeId}-${crypto.randomUUID()}`
      const { error: uploadError } = await this.database.supabase.storage.from('images').upload(path, blob, {
        contentType: 'image/webp',
        upsert: false,
      })
      if (uploadError) {
        console.error('Could not upload a story image', uploadError)
        return { status: this.isCurrentUpload(request) ? 'upload-failed' : 'cancelled' }
      }
      request.path = path
      if (!this.isCurrentUpload(request)) {
        this.discardUpload(path, userId)
        return { status: 'cancelled' }
      }
      uploaded = true
      return { status: 'uploaded', storyId, nodeId, userId, requestId: request.id, path }
    } catch (error: unknown) {
      console.error('Could not upload a story image', error)
      return { status: this.isCurrentUpload(request) ? 'upload-failed' : 'cancelled' }
    } finally {
      if (!uploaded && this.uploads.get(key) === request) this.uploads.delete(key)
    }
  }

  /** Recheck immediately before StoryEditor attaches the uploaded path to JSON. */
  claimUpload(image: UploadedStoryImage): boolean {
    const key = this.uploadKey(image.storyId, image.nodeId)
    const request = this.uploads.get(key)
    if (!request || request.id !== image.requestId || request.path !== image.path || !this.isCurrentUpload(request)) {
      this.discardUpload(image.path, image.userId)
      return false
    }
    this.uploads.delete(key)
    // Also track new files: undoing their insertion can eventually make them unused.
    this.trackImage(image.path, image.userId)
    return true
  }

  cancelNodeUploads(storyId: string, nodeId: string) {
    const key = this.uploadKey(storyId, nodeId)
    const request = this.uploads.get(key)
    if (!request) return
    request.cancelled = true
    this.uploads.delete(key)
    if (request.path) this.discardUpload(request.path, request.userId)
  }

  storyLoaded(storyId: string, storyTree: tree, userId: string | undefined, hasPendingSave: boolean) {
    for (const request of this.uploads.values()) {
      if (!this.isCurrentUpload(request)) this.cancelNodeUploads(request.storyId, request.nodeId)
    }
    this.saveContexts.set(storyId, { userId, pending: hasPendingSave })
    this.refreshRetiredTree(storyId, storyTree, userId)
    this.cleanup()
  }

  saveQueued(storyId: string, storyTree: tree, userId?: string) {
    this.saveContexts.set(storyId, { userId, pending: true })
    this.refreshRetiredTree(storyId, storyTree, userId)
    for (const request of this.uploads.values()) {
      if (request.storyId === storyId && !storyTree.nodes.some(node => node.id === request.nodeId)) {
        this.cancelNodeUploads(request.storyId, request.nodeId)
      }
    }
  }

  saveFinished(storyId: string, hasPendingSave: boolean) {
    const context = this.saveContexts.get(storyId)
    if (context) context.pending = hasPendingSave
    this.cleanup()
  }

  historyReleased() {
    this.cancelAllUploads()
    this.cleanup()
  }

  /** Register only; cleanup waits for the completed gesture and save confirmation. */
  retireImage(imagePath: string) {
    this.trackImage(imagePath, this.saveContexts.get(this.activeStory.storyId())?.userId)
  }

  private trackImage(imagePath: string, userId?: string) {
    const storyId = this.activeStory.storyId()
    if (!storyId) return
    let retired = this.retiredImages.get(storyId)
    if (!retired) {
      retired = { tree: this.activeStory.entireTree(), userId, paths: new Set() }
      this.retiredImages.set(storyId, retired)
    }
    if (!retired.userId && userId) retired.userId = userId
    retired.paths.add(imagePath)
  }

  cleanup() {
    const userId = this.database.user?.()?.id
    for (const [path, ownerId] of this.orphanedUploads) {
      if (userId === ownerId && !this.activeStory.retainsImage(path)) {
        this.removeUnusedFile(path, () => this.orphanedUploads.delete(path))
      }
    }
    for (const [storyId, retired] of this.retiredImages) {
      const hasHistory = this.activeStory.storyId() === storyId &&
        (this.activeStory.canUndo() || this.activeStory.canRedo())
      const currentPaths = new Set(retired.tree.nodes.flatMap(node => node.image ? [node.image.path] : []))
      for (const path of retired.paths) {
        if (!hasHistory && currentPaths.has(path)) {
          retired.paths.delete(path)
          continue
        }
        if (!userId || retired.userId !== userId || this.saveContexts.get(storyId)?.pending ||
          currentPaths.has(path) || this.activeStory.retainsImage(path)) continue
        this.removeUnusedFile(path, () => {
          retired.paths.delete(path)
          if (retired.paths.size === 0 && this.retiredImages.get(storyId) === retired) {
            this.retiredImages.delete(storyId)
          }
        })
      }
      if (retired.paths.size === 0) this.retiredImages.delete(storyId)
    }
  }

  /** Physical storage operation; editor deletions go through retireImage. */
  async removeImage(imagePath: string): Promise<boolean> {
    const { error } = await this.database.supabase.storage.from('images').remove([imagePath])
    if (error) {
      console.error('Could not remove a story image', error)
      return false
    }
    return true
  }

  private async optimizeImage(file: File): Promise<Blob | undefined> {
    const formData = new FormData()
    formData.append('image', file)
    try {
      const response = await fetch(IMAGE_OPTIMIZER_URL, { method: 'POST', body: formData })
      if (!response.ok) return undefined
      return await response.blob()
    } catch (error: unknown) {
      console.warn('Could not optimize a story image', error)
      return undefined
    }
  }

  private isCurrentUpload(request: UploadRequest): boolean {
    return !request.cancelled && !!request.storyId &&
      this.uploads.get(this.uploadKey(request.storyId, request.nodeId)) === request &&
      this.activeStory.storyId() === request.storyId && this.database.user?.()?.id === request.userId &&
      this.activeStory.entireTree().nodes.some(node => node.id === request.nodeId &&
        node.type !== 'group' && node.type !== 'distributor')
  }

  private uploadKey(storyId: string, nodeId: string): string {
    return `${storyId}/${nodeId}`
  }

  private cancelAllUploads() {
    for (const request of this.uploads.values()) this.cancelNodeUploads(request.storyId, request.nodeId)
  }

  private refreshRetiredTree(storyId: string, storyTree: tree, userId?: string) {
    const retired = this.retiredImages.get(storyId)
    if (retired) {
      retired.tree = storyTree
      // Adopt a newly known author, but never reassign another author's files.
      if (!retired.userId && userId) retired.userId = userId
    }
  }

  private discardUpload(path: string, userId: string) {
    this.orphanedUploads.set(path, userId)
    this.cleanup()
  }

  private removeUnusedFile(path: string, removed: () => void) {
    if (this.removingImages.has(path)) return
    this.removingImages.add(path)
    void this.removeImage(path).then(success => {
      if (success) removed()
    }).catch((error: unknown) => {
      console.warn('Could not clean up an unused story image', error)
    }).finally(() => this.removingImages.delete(path))
  }
}
