import { Component, Input, Renderer2, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { createGame, Game, SceneAnswer, Visit } from '@trama/engine'
import { StoryPlayerComponent } from 'src/app/features/playground/components/story-player/story-player.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { Router } from '@angular/router'
import { storyPlainText } from 'src/app/shared/utils/story-html'
import { ThemeService } from 'src/app/shared/services/theme.service'
import { ToggleComponent } from 'src/app/shared/components/ui/toggle/toggle.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

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

  async getStoryByCorrectID() {
    let story, configuration
    if (this.storyId) {
      // Get the story and configuration to save it to activeStory and use activeStory from now on
      story = await this.db.getStoryWithID(this.storyId)
      configuration = await this.db.getConfigurationOf(story.id)
    } else if (this.customId) {
      story = await this.db.getStoryWithCustomID(this.customId)
      configuration = await this.db.getConfigurationOf(story.id)
    }

    return { story, configuration }
  }

  async ngOnInit(): Promise<void> {
    const { story, configuration } = await this.getStoryByCorrectID()

    if (!story || !configuration) {
      this.router.navigate(['/not-found'])
      return
    }

    this.activeStory.load(story.id, story.name, story.tree)
    this.activeStory.patchConfiguration({
      customId: configuration.custom_id,
      tracking: configuration.tracking,
      sharing: configuration.sharing,
      tapLink: configuration.tapLink,
      footer: configuration.footer,
      cumulativeMode: configuration.cumulativeMode,
    })

    // The page plays through @trama/engine; activeStory only holds the story
    // name and configuration that the header and shared views read.
    const game = createGame(story.tree ?? {})
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
