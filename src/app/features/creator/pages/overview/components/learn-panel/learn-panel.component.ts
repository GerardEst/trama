import { Component, computed, inject } from '@angular/core'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { SITE_PAGES, siteUrl } from 'src/app/core/site-links'

/** The guide's chapters an author needs first, each with its anchor on the site, icon and frame colour. */
const LESSONS: { id: string; title: TranslationKey; icon: string; color: string }[] = [
  { id: 'content-nodes', title: 'dashboard.overview.lessons.contentNodes', icon: 'stories', color: 'blue' },
  { id: 'events', title: 'dashboard.overview.lessons.events', icon: 'flag', color: 'lavender' },
  { id: 'conditional-paths', title: 'dashboard.overview.lessons.conditionalPaths', icon: 'condition', color: 'mint' },
  { id: 'variables', title: 'dashboard.overview.lessons.variables', icon: 'tag', color: 'yellow' },
  { id: 'images', title: 'dashboard.overview.lessons.images', icon: 'camera', color: 'peach' },
  { id: 'share-node', title: 'dashboard.overview.lessons.share', icon: 'share', color: 'rose' },
]

/** Short ways into the guide on the site, always at hand beside the stories. */
@Component({
  selector: 'polo-learn-panel',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './learn-panel.component.html',
  host: { role: 'region', 'aria-labelledby': 'learn-title' },
  styleUrl: './learn-panel.component.css',
})
export class LearnPanelComponent {
  private readonly i18n = inject(I18nService)
  readonly guideUrl = computed(() => siteUrl(this.i18n.lang(), SITE_PAGES.features))
  readonly lessons = computed(() => LESSONS.map((lesson) => ({ ...lesson, href: siteUrl(this.i18n.lang(), SITE_PAGES.features, lesson.id) })))
}
