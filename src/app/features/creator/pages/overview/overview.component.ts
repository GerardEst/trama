import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { AlertService } from 'src/app/core/services/alert.service'
import { DeleteStoryComponent } from 'src/app/shared/components/delete-story/delete-story.component'
import { tetherPopover } from 'src/app/shared/utils/popover-tether'
import { StoryOverview } from 'src/app/core/interfaces/story-overview'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { environment } from 'src/environments/environment'
import { ModalService } from 'src/app/core/services/modal.service'
import { StoryOpenerService } from 'src/app/shared/services/story-opener.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { ShareStoryComponent } from 'src/app/features/dashboard/modals/share-story/share-story.component'
import { FirstStepsComponent } from './components/first-steps/first-steps.component'
import { ActivityPanelComponent } from './components/activity-panel/activity-panel.component'
import { LearnPanelComponent } from './components/learn-panel/learn-panel.component'
import { RECENT_DAYS, playsPerDay } from './recent-days'

export { RECENT_DAYS }

/** The frame colours a story's card is tinted with, picked from its id so it keeps its colour. */
const TINTS = ['blue', 'lavender', 'mint', 'yellow', 'peach', 'rose'] as const

/** The dashboard's home: every story with how much it is played, the activity of all of them and the guide at hand. */
@Component({
  selector: 'polo-creator-overview',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FirstStepsComponent, ActivityPanelComponent, LearnPanelComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['../../../../shared/layout/page.css', './overview.component.css'],
})
export class OverviewComponent implements OnInit {
  private readonly db = inject(DatabaseService)
  private readonly router = inject(Router)
  private readonly i18n = inject(I18nService)
  private readonly alert = inject(AlertService)
  private readonly modal = inject(ModalService)
  private readonly opener = inject(StoryOpenerService)
  private readonly activeStory = inject(ActiveStoryService)

  readonly recentDays = RECENT_DAYS
  readonly stories = signal<StoryOverview[] | null>(null)
  readonly failed = signal(false)
  readonly creating = signal(false)
  readonly createFailed = signal(false)
  readonly deleteFailed = signal<string | null>(null)
  readonly tether = tetherPopover
  readonly query = signal('')
  readonly sort = signal<'edited' | 'plays' | 'name'>('edited')
  /** Plays on each day of the recent window, today last, once they are known. */
  readonly playDays = signal<number[] | null>(null)

  /** The stories the author is looking for, in the order they asked for. */
  readonly shownStories = computed(() => {
    const query = this.query().trim().toLocaleLowerCase()
    const stories = (this.stories() ?? []).filter((story) => !query || story.name.toLocaleLowerCase().includes(query))
    const sort = this.sort()
    return [...stories].sort((a, b) => sort === 'name'
      ? a.name.localeCompare(b.name, this.i18n.lang())
      : sort === 'plays'
        ? b.plays - a.plays
        : (b.editedAt ?? '').localeCompare(a.editedAt ?? ''))
  })

  readonly totals = computed(() => {
    const stories = this.stories() ?? []
    return {
      stories: stories.length,
      tracked: stories.filter((story) => story.tracking).length,
      plays: stories.reduce((sum, story) => sum + story.plays, 0),
      recentPlays: stories.reduce((sum, story) => sum + story.recentPlays, 0),
    }
  })

  private readonly since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000)

  async ngOnInit() {
    const userId = this.db.user()?.id
    const stories = userId ? await this.db.getStoriesOverview(userId, this.since) : null
    if (!stories) {
      this.failed.set(true)
      return
    }
    this.stories.set(stories)
    await this.loadPlayDays()
  }

  /** The strip of days needs each play's date, asked for only when there are recent plays to draw. */
  private async loadPlayDays() {
    const stories = this.stories() ?? []
    if (!stories.some((story) => story.recentPlays > 0)) {
      this.playDays.set(null)
      return
    }
    const dates = await this.db.getRecentPlayDates(stories.map((story) => story.id), this.since)
    this.playDays.set(dates ? playsPerDay(dates) : null)
  }

  private readonly host = new URL(environment.baseRoute).host

  /** Where readers find the story when it has its own address. */
  address(story: StoryOverview) {
    return story.slug ? `${this.host}/${story.slug}` : null
  }

  tint(story: StoryOverview) {
    let hash = 0
    for (const char of story.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
    return TINTS[hash % TINTS.length]
  }

  initial(story: StoryOverview) {
    return story.name.trim().charAt(0).toUpperCase() || '·'
  }

  lastPlayed(story: StoryOverview) {
    return story.lastPlayedAt ? this.i18n.formatDate(story.lastPlayedAt, { dateStyle: 'medium' }) : null
  }

  edited(story: StoryOverview) {
    return story.editedAt ? this.i18n.formatRelative(story.editedAt) : null
  }

  /** Sharing is quick, so it opens in place, as in the editor, instead of leading to another page. */
  async share(story: StoryOverview, menu: HTMLElement) {
    menu.hidePopover()
    if (await this.opener.open(story.id)) this.modal.launch(ShareStoryComponent)
  }

  async createStory() {
    if (this.creating()) return
    this.creating.set(true)
    this.createFailed.set(false)
    const story = await this.db.createEmptyStory(this.i18n.t('dashboard.newStoryName'))
    this.creating.set(false)
    if (story) this.router.navigate(['/story', story.id, 'board'])
    else this.createFailed.set(true)
  }

  async deleteStory(story: StoryOverview, menu: HTMLElement) {
    menu.hidePopover()
    this.deleteFailed.set(null)
    if (!(await this.alert.launch(DeleteStoryComponent, { storyName: story.name }))) return
    try {
      await this.db.deleteStory(story.id)
    } catch {
      this.deleteFailed.set(story.name)
      return
    }
    this.stories.update((stories) => stories?.filter((item) => item.id !== story.id) ?? null)
    void this.loadPlayDays()
    if (readLastOpened() === story.id) forgetLastOpened()
    // As from its own page: a deleted story must not stay open, or opening it again would show it.
    if (this.activeStory.storyId() === story.id) this.activeStory.reset()
  }
}

// The editor remembers the last story it opened; storage may be unavailable.
function readLastOpened() {
  try {
    return localStorage.getItem('polo-id')
  } catch {
    return null
  }
}

function forgetLastOpened() {
  try {
    localStorage.removeItem('polo-id')
  } catch {
    // Nothing to forget.
  }
}
