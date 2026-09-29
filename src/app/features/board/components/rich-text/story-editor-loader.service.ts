import { Injectable } from '@angular/core'

export type StoryEditorRuntime = typeof import('./story-editor-runtime')

@Injectable({ providedIn: 'root' })
export class StoryEditorLoader {
  private runtime?: Promise<StoryEditorRuntime>

  load(): Promise<StoryEditorRuntime> {
    this.runtime ??= import('./story-editor-runtime').catch((error: unknown) => {
      // Let the next attempt retry instead of caching a failed chunk request.
      this.runtime = undefined
      throw error
    })
    return this.runtime
  }

  // Warm the editor chunk without blocking anything; a real load retries on failure.
  prefetch() { this.load().catch(() => undefined) }

  prefetchWhenIdle() {
    if ('requestIdleCallback' in window) requestIdleCallback(() => this.prefetch(), { timeout: 5000 })
    else setTimeout(() => this.prefetch(), 2000)
  }
}
