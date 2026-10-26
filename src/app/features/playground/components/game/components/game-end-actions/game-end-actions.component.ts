import { Component, computed, Input } from '@angular/core'
import { link, shareOptions } from 'src/app/core/interfaces/interfaces'
import { normalizeLink } from 'src/app/shared/utils/normalizers'
import { shareStoryLink, storyReadingUrl } from 'src/app/shared/utils/story-sharing'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { environment } from 'src/environments/environment'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'

@Component({
  selector: 'polo-game-end-actions',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './game-end-actions.component.html',
  styleUrl: './game-end-actions.component.css',
})
export class GameEndActionsComponent {
  @Input() links: link[] = []
  @Input() share?: shareOptions
  @Input() text = ''
  @Input() sharing = false

  feedback: TranslationKey | null = null
  busy = false
  normalizeLink = normalizeLink
  readonly readingUrl = computed(() => this.activeStory.storyId()
    ? storyReadingUrl(environment.baseRoute, this.activeStory.storyId(), this.activeStory.storyConfiguration().customId)
    : window.location.href)

  constructor(private activeStory: ActiveStoryService, private i18n: I18nService) {}

  async shareStory() {
    if (this.busy) return
    this.busy = true
    this.feedback = null
    const title = this.activeStory.storyName() || 'Trama'
    const text = this.share?.sharedText || this.i18n.t('playground.shareMessage', { title })
    const result = await shareStoryLink({ title, text, url: this.readingUrl() })
    if (result === 'copied') this.feedback = 'playground.linkCopied'
    if (result === 'manual') this.feedback = 'playground.copyManually'
    this.busy = false
  }

  selectLink(event: FocusEvent) {
    if (event.target instanceof HTMLInputElement) event.target.select()
  }
}
