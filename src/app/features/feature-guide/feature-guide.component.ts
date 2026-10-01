import {
  Component,
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

@Component({
  selector: 'polo-feature-guide',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './feature-guide.component.html',
  styleUrl: './feature-guide.component.sass',
})
export class FeatureGuideComponent implements OnInit {
  readonly groups = FEATURE_GUIDE
  readonly featureCount = FEATURE_GUIDE.reduce(
    (count, group) => count + group.features.length,
    0
  )
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
    this.title.setTitle('Feature guide — Trama')
    this.meta.updateTag({
      name: 'description',
      content:
        'Explore Trama’s story-building tools: events, conditional paths, requirements, variables, focus mode, images, sharing, groups and more. Practical examples, no code required.',
    })
  }
}
