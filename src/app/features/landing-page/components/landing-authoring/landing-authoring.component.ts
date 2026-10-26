import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

export type AuthoringView = 'write' | 'map' | 'preview' | 'share'

@Component({
  selector: 'polo-landing-authoring',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './landing-authoring.component.html',
  styleUrl: './landing-authoring.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingAuthoringComponent {
  private readonly i18n = inject(I18nService)
  readonly views: readonly AuthoringView[] = ['write', 'map', 'preview', 'share']
  readonly selected = signal<AuthoringView>('write')
  readonly captureSrc = computed(() =>
    `/assets/images/landing/authoring/${this.i18n.lang()}-${this.selected()}.webp`
  )

  copyKey(view: AuthoringView, field: 'title' | 'description' | 'caption' | 'alt'): TranslationKey {
    return `landing.authoring.${view}.${field}`
  }
}
