import { Component, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { AlertService } from 'src/app/core/services/alert.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { StoryExportService } from 'src/app/shared/services/story-export.service'
import { StoryOptionsComponent } from 'src/app/shared/components/story-options/story-options.component'
import { ShareStoryComponent } from 'src/app/features/dashboard/modals/share-story/share-story.component'
import { DeleteStoryComponent } from 'src/app/shared/components/delete-story/delete-story.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'

/**
 * Every setting of the story: its name, the options and the sharing the editor also offers in its
 * dialogs, who it is published as, a copy of its data and deleting it.
 */
@Component({
  selector: 'polo-story-general',
  standalone: true,
  imports: [StoryOptionsComponent, ShareStoryComponent, TranslatePipe],
  templateUrl: './general.component.html',
  styleUrls: ['../../../../shared/layout/page.css', './general.component.css'],
})
export class StoryGeneralComponent {
  private readonly db = inject(DatabaseService)
  private readonly alert = inject(AlertService)
  private readonly router = inject(Router)
  private readonly mutations = inject(StoryMutationService)
  private readonly storyExport = inject(StoryExportService)
  readonly activeStory = inject(ActiveStoryService)

  /** Brands are design only: every story is published under the creator profile for now. */
  readonly authorName = computed(() => this.db.user()?.profile?.user_name || this.db.user()?.email || '')
  readonly savingName = signal(false)
  readonly nameFeedback = signal<TranslationKey | null>(null)
  readonly deleteFailed = signal(false)

  async saveName(event: Event, value: string) {
    event.preventDefault()
    if (this.savingName() || value.trim() === this.activeStory.storyName()) return
    this.savingName.set(true)
    this.nameFeedback.set(null)
    const saved = await this.mutations.renameStory(value)
    this.savingName.set(false)
    this.nameFeedback.set(saved ? 'dashboard.story.nameSaved' : 'dashboard.story.nameError')
  }

  exportStory() {
    this.storyExport.downloadJson()
  }

  async deleteStory() {
    const storyId = this.activeStory.storyId()
    this.deleteFailed.set(false)
    if (!(await this.alert.launch(DeleteStoryComponent, { storyName: this.activeStory.storyName() }))) return
    try {
      await this.db.deleteStory(storyId)
    } catch {
      this.deleteFailed.set(true)
      return
    }
    try {
      if (localStorage.getItem('polo-id') === storyId) localStorage.removeItem('polo-id')
    } catch {
      // The editor will notice the story is gone on its own.
    }
    this.activeStory.reset()
    this.router.navigate(['/dashboard'])
  }
}
