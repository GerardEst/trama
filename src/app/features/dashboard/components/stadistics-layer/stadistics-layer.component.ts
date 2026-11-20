import { Component, OnDestroy, effect, signal, untracked } from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from '../../../../shared/components/ui/basic-button/basic-button.component'
import { StatisticsService } from 'src/app/shared/services/statistics.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-stadistics-layer',
  standalone: true,
  imports: [BasicButtonComponent, TranslatePipe],
  templateUrl: './stadistics-layer.component.html',
  styleUrl: './stadistics-layer.component.css',
})
export class StadisticsLayerComponent implements OnDestroy {
  readonly games = signal<any[] | undefined>(undefined)
  /** The board elements this panel highlighted, so they can be cleared. */
  private readonly highlighted = new Set<string>()
  private loadRequest = 0

  constructor(
    private story: ActiveStoryService,
    private stadistics: StatisticsService
  ) {
    // The board stays open while the author switches stories, and so does this panel.
    effect(() => {
      const storyId = this.story.storyId()
      untracked(() => void this.load(storyId))
    })
  }

  private async load(storyId: string) {
    const request = ++this.loadRequest
    this.clearHighlights()
    this.games.set(undefined)
    if (!storyId) return
    const games = await this.stadistics.getGamesOf(storyId)
    if (request !== this.loadRequest) return
    this.games.set(games || undefined)
  }

  toggleGame(game: any, event: Event) {
    const show = (event.target as HTMLInputElement).checked
    for (const step of game.path ?? []) {
      if (step.type !== 'node' && step.type !== 'answer') continue
      document.getElementById(step.id)?.classList.toggle('highlighted', show)
      if (show) this.highlighted.add(step.id)
      else this.highlighted.delete(step.id)
    }
  }

  showGameData(_game: any) {
    // Not built yet: a modal with everything about the game.
  }

  ngOnDestroy() {
    this.loadRequest++
    this.clearHighlights()
  }

  private clearHighlights() {
    for (const id of this.highlighted) document.getElementById(id)?.classList.remove('highlighted')
    this.highlighted.clear()
  }
}
