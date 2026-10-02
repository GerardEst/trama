import {
  Component,
  computed,
  effect,
  Injector,
  OnInit,
  afterNextRender,
  inject,
} from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { Meta, Title } from '@angular/platform-browser'
import { FEATURE_GUIDE } from './feature-guide.content'
import { FEATURE_GUIDE_ES } from './feature-guide.content.es'
import { FEATURE_GUIDE_CA } from './feature-guide.content.ca'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-feature-guide',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, TranslatePipe],
  templateUrl: './feature-guide.component.html',
  styleUrl: './feature-guide.component.sass',
})
export class FeatureGuideComponent implements OnInit {
  private readonly i18n = inject(I18nService)
  // Every translation shares the same chapter ids, so deep links work in all languages.
  readonly groups = computed(() =>
    this.i18n.pick({ en: FEATURE_GUIDE, es: FEATURE_GUIDE_ES, ca: FEATURE_GUIDE_CA })
  )
  readonly featureCount = computed(() =>
    this.groups().reduce((count, group) => count + group.features.length, 0)
  )
  readonly homeUrl = computed(() => (this.i18n.lang() === 'en' ? '/' : `/${this.i18n.lang()}`))
  private readonly title = inject(Title)
  private readonly meta = inject(Meta)
  private readonly route = inject(ActivatedRoute)
  private readonly injector = inject(Injector)
  private readonly featureIds = new Set(
    FEATURE_GUIDE.flatMap((group) =>
      group.features.map((feature) => feature.id)
    )
  )

  constructor() {
    // Scope deep-link scrolling to this public guide, without changing board routing.
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => {
      afterNextRender(
        () => {
          if (!fragment) {
            window.scrollTo(0, 0)
            return
          }
          if (!this.featureIds.has(fragment)) return
          const chapter = document.getElementById(fragment)
          chapter?.scrollIntoView({ block: 'start' })
          chapter?.focus({ preventScroll: true })
        },
        { injector: this.injector }
      )
    })
  }

  ngOnInit() {
    effect(
      () => {
        this.title.setTitle(this.i18n.t('guide.meta.title'))
        this.meta.updateTag({ name: 'description', content: this.i18n.t('guide.meta.description') })
      },
      { injector: this.injector }
    )
  }
}
