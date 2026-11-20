import { Component, DestroyRef, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { StoryOpenerService } from 'src/app/shared/services/story-opener.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { siteUrl } from 'src/app/core/site-links'
import { UserMenuComponent } from 'src/app/shared/components/user-menu/user-menu.component'
import { WordmarkComponent } from 'src/app/shared/components/wordmark/wordmark.component'

type LoadState = 'loading' | 'ready' | 'missing'

/**
 * One story outside the editor, with the same frame as the dashboard. It opens the story the way
 * the editor does, so the options and sharing controls of the editor work here unchanged.
 */
@Component({
  selector: 'polo-story-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, UserMenuComponent, WordmarkComponent],
  templateUrl: './story-shell.component.html',
  styleUrl: '../../shared/layout/shell.css',
})
export class StoryShellComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly opener = inject(StoryOpenerService)
  private readonly mutations = inject(StoryMutationService)
  private readonly i18n = inject(I18nService)
  readonly activeStory = inject(ActiveStoryService)

  readonly homeUrl = computed(() => siteUrl(this.i18n.lang()))
  readonly storyId = signal('')
  readonly state = signal<LoadState>('loading')
  private loadRequest = 0

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((params) => {
      void this.open(params.get('storyId') ?? '')
    })
  }

  private async open(storyId: string) {
    const request = ++this.loadRequest
    this.storyId.set(storyId)
    if (!(this.activeStory.storyId() === storyId && !this.mutations.isDraft(storyId))) this.state.set('loading')
    const opened = await this.opener.open(storyId, () => request === this.loadRequest)
    if (request !== this.loadRequest) return
    this.state.set(opened ? 'ready' : 'missing')
  }
}
