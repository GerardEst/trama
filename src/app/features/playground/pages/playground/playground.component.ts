import { Component, Input, Renderer2, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { createGame, fetchStory, Game, PublishedStory, SceneAnswer, Visit } from '@trama/engine'
import { StoryPlayerComponent } from 'src/app/features/playground/components/story-player/story-player.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { Router } from '@angular/router'
import { storyPlainText } from 'src/app/shared/utils/story-html'
import { ThemeService } from 'src/app/shared/services/theme.service'
import { ToggleComponent } from 'src/app/shared/components/ui/toggle/toggle.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'polo-playground',
  standalone: true,
  imports: [CommonModule, StoryPlayerComponent, ToggleComponent, TranslatePipe],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css'],
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  // Complex id, used for private stories
  @Input() storyId: string = ''
  // Easy and customizable id, used for public stories
  @Input() customId: string = ''

  userName: string | null = null
  playerPath: Array<any> = []
  gameId?: string
  game?: Game
  private unsubscribe?: () => void

  constructor(
    private db: DatabaseService,
    public activeStory: ActiveStoryService,
    public theme: ThemeService,
    private router: Router,
    private renderer: Renderer2
  ) {}
  // In activeStory we have everything about the story, the options, tree, refs, etc

  /** Players read stories through the same public API as external fronts. */
  private async loadStory(): Promise<PublishedStory | undefined> {
    const reference = this.storyId ? { id: this.storyId } : this.customId ? { slug: this.customId } : undefined
    if (!reference) return undefined
    try {
      return await fetchStory(reference, { api: `${environment.apiUrl}/functions/v1/story` })
    } catch (error: unknown) {
      console.error('Could not load the story', error)
      return undefined
    }
  }

  async ngOnInit(): Promise<void> {
    const story = await this.loadStory()

    if (!story) {
      this.router.navigate(['/not-found'])
      return
    }

    // The header and the shared player views read the name and settings from here.
    this.activeStory.load(story.id, story.name, {})
    this.activeStory.patchConfiguration({
      customId: story.slug ?? undefined,
      tracking: story.settings.tracking,
      sharing: story.settings.sharing,
      tapLink: story.settings.tapLink,
      footer: story.settings.footer,
      cumulativeMode: story.settings.cumulativeMode,
    })

    // The page plays through @trama/engine; activeStory only holds the story
    // name and configuration that the header and shared views read.
    const game = createGame(story.tree)
    this.unsubscribe = game.subscribe(event => {
      if (event.type === 'node') this.drawNode(event.visit)
      else if (event.type === 'answer') this.selectAnswer(event.answer)
      else if (event.type === 'end') this.endGame()
    })
    this.game = game
    this.displayGame()
  }

  ngOnDestroy() {
    this.unsubscribe?.()
  }

  async displayGame(event?: Event) {
    event?.preventDefault()

    if (this.activeStory.storyConfiguration().tracking) {
      this.gameId = self.crypto.randomUUID()

      // We upload an empty game
      // In case the user refresh(and uses the same id) it keeps the trace that something happened... 👀
      this.saveGame()
    }
  }

  private async saveGame() {
    if (!this.gameId) return console.error('Cannot save adventure')

    const player = this.game?.getState().player ?? { properties: {}, stats: {}, conditions: [] }
    const saved = await this.db.saveNewGameTo(
      this.gameId,
      player.properties['id'] || 'anonymous',
      this.activeStory.storyId(),
      this.playerPath,
      player
    )
    if (!saved) console.error('Error saving game')
  }

  endGame() {
    if (this.activeStory.storyConfiguration().tracking) {
      this.saveGame()
    }
  }

  selectAnswer(answer: SceneAnswer) {
    if (this.activeStory.storyConfiguration().tracking) {
      this.playerPath.push({
        type: 'answer',
        id: answer.id,
        text: storyPlainText(answer.text),
        timestamp: Date.now(),
      })
    }
  }

  drawNode(visit: Visit) {
    if (this.activeStory.storyConfiguration().tracking) {
      this.playerPath.push({
        type: 'node',
        id: visit.nodeId,
        text: storyPlainText(visit.scene.text),
        timestamp: Date.now(),
      })
    }
  }
}
