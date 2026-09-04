import { Injectable, effect } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActiveStoryService } from './active-story.service'

/** Keeps the browser title synchronized with the active story name. */
@Injectable({
  providedIn: 'root',
})
export class ActiveStoryTitleService {
  constructor(activeStory: ActiveStoryService, title: Title) {
    effect(() => {
      const storyName = activeStory.storyName().trim()
      if (storyName) title.setTitle(storyName)
    })
  }
}
