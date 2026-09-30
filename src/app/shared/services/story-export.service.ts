import { DOCUMENT } from '@angular/common'
import { Inject, Injectable } from '@angular/core'
import { ActiveStoryService } from './active-story.service'

@Injectable({
  providedIn: 'root',
})
export class StoryExportService {
  constructor(
    private activeStory: ActiveStoryService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  downloadJson() {
    const id = this.activeStory.storyId()
    if (!id) return

    // Export the live editor state, including changes still queued for saving.
    // Only story data is included, never account/session or player data.
    const json = JSON.stringify(
      {
        format: 'trama-story',
        version: 1,
        exportedAt: new Date().toISOString(),
        id,
        name: this.activeStory.storyName(),
        tree: this.activeStory.entireTree(),
        configuration: this.activeStory.storyConfiguration(),
      },
      null,
      2
    )
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = this.document.createElement('a')

    try {
      anchor.href = url
      anchor.download = this.fileName(this.activeStory.storyName())
      this.document.body.appendChild(anchor)
      anchor.click()
    } finally {
      anchor.remove()
      // Give the browser time to start the download before releasing the URL.
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }

  private fileName(name: string): string {
    const base = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
    return `${base || 'story'}.json`
  }
}
