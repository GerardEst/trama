import { Component, Input } from '@angular/core'
import { link, shareOptions } from 'src/app/core/interfaces/interfaces'
import { normalizeLink } from 'src/app/shared/utils/normalizers'
import { storyPlainText } from 'src/app/shared/utils/story-html'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'

@Component({
  selector: 'polo-game-end-actions',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './game-end-actions.component.html',
  styleUrl: './game-end-actions.component.sass',
})
export class GameEndActionsComponent {
  @Input() links: link[] = []
  @Input() share?: shareOptions
  @Input() text = ''
  @Input() sharing = false

  feedback: TranslationKey | null = null
  normalizeLink = normalizeLink

  async shareStory() {
    const text = this.share?.sharedText || storyPlainText(this.text)
    if (navigator.share) {
      try {
        await navigator.share({ text, url: window.location.href })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      this.feedback = 'playground.linkCopied'
    } catch {
      this.feedback = 'playground.copyManually'
    }
  }
}
