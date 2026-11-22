import { Component, Input, computed, signal } from '@angular/core'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { RECENT_DAYS } from '../../recent-days'

export interface ActivityTotals {
  stories: number
  tracked: number
  plays: number
  recentPlays: number
}

/** The author's plays at a glance: the recent ones, a strip of days and the totals. */
@Component({
  selector: 'polo-activity-panel',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './activity-panel.component.html',
  host: { role: 'region', 'aria-labelledby': 'activity-title' },
  styleUrl: './activity-panel.component.css',
})
export class ActivityPanelComponent {
  @Input({ required: true }) totals!: ActivityTotals
  /** Plays on each day of the recent window, today last; empty days until they are known. */
  @Input() set days(days: readonly number[] | null) {
    this.counts.set(days?.length === RECENT_DAYS ? days : new Array<number>(RECENT_DAYS).fill(0))
  }

  readonly recentDays = RECENT_DAYS
  private readonly counts = signal<readonly number[]>(new Array<number>(RECENT_DAYS).fill(0))
  /** How far each day fills, against the busiest day, so a quiet day still shows. */
  readonly bars = computed(() => {
    const counts = this.counts()
    const busiest = Math.max(1, ...counts)
    return counts.map((count) => (count ? `${Math.max(18, Math.round((count / busiest) * 100))}%` : '0%'))
  })
}
