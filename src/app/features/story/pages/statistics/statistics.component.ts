import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { GameRow, RECENT_DAYS, StatSummary, summarize } from './story-statistics'

type SortColumn = 'name' | 'date' | string
type LoadState = 'loading' | 'ready' | 'failed'

/**
 * How a story is played: how many games, how they end and how players finish, then every game.
 * Games are only stored while tracking is on, which the page says when it is off.
 */
@Component({
  selector: 'polo-story-statistics',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './statistics.component.html',
  styleUrls: ['../../../../shared/layout/page.css', './statistics.component.css'],
})
export class StoryStatisticsComponent implements OnInit {
  private readonly db = inject(DatabaseService)
  private readonly i18n = inject(I18nService)
  readonly activeStory = inject(ActiveStoryService)

  readonly recentDays = RECENT_DAYS
  readonly state = signal<LoadState>('loading')
  readonly games = signal<GameRow[]>([])
  readonly sort = signal<{ column: SortColumn, descending: boolean }>({ column: 'date', descending: true })

  readonly summary = computed(() => summarize(this.games(), this.activeStory.entireTree()))
  readonly references = computed(() => this.summary().references)
  readonly maxEnding = computed(() => Math.max(1, ...this.summary().endings.map((ending) => ending.count)))

  readonly rows = computed(() => {
    const { column, descending } = this.sort()
    const direction = descending ? -1 : 1
    const value = (gameRow: GameRow): string | number => {
      if (column === 'name') return gameRow.user_name.toLocaleLowerCase()
      if (column === 'date') return gameRow.created_at
      const ref = this.references().find((item) => item.id === column)
      if (ref?.type === 'condition') return gameRow.result?.conditions?.includes(column) ? 1 : 0
      return Number(gameRow.result?.stats?.[column]) || 0
    }
    return [...this.games()].sort((a, b) => {
      const [first, second] = [value(a), value(b)]
      return (first < second ? -1 : first > second ? 1 : 0) * direction
    })
  })

  async ngOnInit() {
    const storyId = this.activeStory.storyId()
    const games = storyId ? await this.db.getStadisticsOfTree(storyId, true) : false
    if (games === false) {
      this.state.set('failed')
      return
    }
    this.games.set(games as unknown as GameRow[])
    this.state.set('ready')
  }

  sortBy(column: SortColumn) {
    this.sort.update((current) => current.column === column
      ? { column, descending: !current.descending }
      // Numbers and dates read best from the highest; names from A.
      : { column, descending: column !== 'name' })
  }

  ariaSort(column: SortColumn) {
    const current = this.sort()
    if (current.column !== column) return 'none'
    return current.descending ? 'descending' : 'ascending'
  }

  statValue(gameRow: GameRow, ref: StatSummary) {
    return gameRow.result?.stats?.[ref.id] ?? 0
  }

  met(gameRow: GameRow, ref: StatSummary) {
    return !!gameRow.result?.conditions?.includes(ref.id)
  }

  formatRelative(date: string) {
    return this.i18n.formatRelative(date)
  }

  formatDate(date: string) {
    return this.i18n.formatDate(new Date(date), { dateStyle: 'medium', timeStyle: 'short' })
  }

  formatAverage(value: number) {
    return this.i18n.formatNumber(value, { maximumFractionDigits: 1 })
  }

  formatPercent(value: number) {
    return this.i18n.formatNumber(value, { style: 'percent', maximumFractionDigits: 0 })
  }
}
