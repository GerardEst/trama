import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GameComponent } from 'src/app/components/game/game.component'
import { DatabaseService } from 'src/app/services/database.service'
import { ModalWindowComponent } from 'src/app/components/ui/modal-window/modal-window.component'
import { node, node_answer } from 'src/app/interfaces'
import { PlayerService } from './services/player.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { AccentButtonComponent } from 'src/app/components/ui/accent-button/accent-button.component'
import * as Cronitor from '@cronitorio/cronitor-rum'

@Component({
  selector: 'polo-playground',
  standalone: true,
  imports: [
    CommonModule,
    ModalWindowComponent,
    GameComponent,
    AccentButtonComponent,
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.sass'],
})
export class PlaygroundComponent {
  // Complex id, used for private stories
  @Input() storyId: string = ''
  // Easy and customizable id, used for public stories
  @Input() customId: string = ''

  userName: string | null = null
  playerPath: Array<any> = []
  externalEvents: Array<any> = []
  gameId?: string
  gotUserInfo: boolean = false
  customStyles?: string

  constructor(
    private db: DatabaseService,
    public playerService: PlayerService,
    public activeStory: ActiveStoryService
  ) {}
  // In playerService we have everything about the player, the counters, etc
  // In activeStory we have everything about the story, the options, tree, refs, etc

  async getStoryByCorrectID() {
    let story, configuration
    if (this.storyId) {
      // Get the story and configuration to save it to activeStory and use activeStory from now on
      story = await this.db.getStoryWithID(this.storyId)
      configuration: configuration = await this.db.getConfigurationOf(story.id)
    } else if (this.customId) {
      story = await this.db.getStoryWithCustomID(this.customId)
      configuration: configuration = await this.db.getConfigurationOf(story.id)
    }

    return { story, configuration }
  }

  async ngOnInit(): Promise<void> {
    Cronitor.track('SomeoneStartedAGame')

    const { story, configuration } = await this.getStoryByCorrectID()

    this.activeStory.storyId.set(story.id)
    this.activeStory.entireTree.set(story.tree)
    this.activeStory.storyName.set(story.name)

    this.activeStory.storyConfiguration().tracking = configuration.tracking
    this.activeStory.storyConfiguration().sharing = configuration.sharing
    this.activeStory.storyConfiguration().askName = configuration.askName
    this.activeStory.storyConfiguration().footer = configuration.footer

    //this.customStyles = configuration.customStyles
    this.customStyles = configuration.customStyles || 'modern'

    // We have to manually init the refs by now
    this.activeStory.initTreeRefs()

    if (!this.activeStory.storyConfiguration().askName) this.displayGame()
  }

  async displayGame(event?: Event) {
    event?.preventDefault()

    this.gotUserInfo = true

    if (this.activeStory.storyConfiguration().tracking) {
      this.startTabChangeDetection()
      this.startBlurWindowDetection()

      this.gameId = self.crypto.randomUUID()

      // We upload an empty game
      // In case the user refresh(and uses the same name) it keeps the trace that something happened... 👀
      this.saveGame({})
    }
  }

  public setUserName(event: any) {
    this.playerService.player.set({
      ...this.playerService.player(),
      name: event.target.value,
    })
  }

  private async saveGame(result: any) {
    if (!this.gameId) return console.error('Cannot save adventure')

    const saved = await this.db.saveNewGameTo(
      this.gameId,
      this.playerService.player().name || 'anonymous',
      this.storyId,
      this.playerPath,
      result,
      this.externalEvents
    )
    if (saved) {
      console.log('Game saved!', saved)
    } else {
      console.error('Error saving game')
    }
  }

  endGame() {
    Cronitor.track('SomeoneEndedAGame')
    if (this.activeStory.storyConfiguration().tracking) {
      console.log('Saving game')
      const userFinalStats = this.playerService.player()
      this.saveGame(userFinalStats)
    }
  }

  selectAnswer(answer: node_answer) {
    if (this.activeStory.storyConfiguration().tracking) {
      this.playerPath.push({
        type: 'answer',
        id: answer.id,
        text: answer.text,
        timestamp: Date.now(),
      })
      console.log('Selection registered', this.playerPath)
    }
  }

  drawNode(node: node) {
    if (this.activeStory.storyConfiguration().tracking) {
      this.playerPath.push({
        type: 'node',
        id: node.id,
        text: node.text,
        timestamp: Date.now(),
      })
      console.log('Node registered', this.playerPath)
    }
  }

  private startTabChangeDetection() {
    document.addEventListener('visibilitychange', () => {
      let externalEvent
      if (document.hidden) {
        externalEvent = { name: 'leaveTab', time: Date.now() }
        this.externalEvents.push(externalEvent)
      } else {
        externalEvent = { name: 'goBackToTab', time: Date.now() }
        this.externalEvents.push(externalEvent)
      }
    })
  }

  private startBlurWindowDetection() {
    window.addEventListener('focus', () => {
      let externalEvent = {
        name: 'focusWindow',
        time: Date.now(),
      }
      this.externalEvents.push(externalEvent)
    })
    window.addEventListener('blur', () => {
      let externalEvent = {
        name: 'blurWindow',
        time: Date.now(),
      }
      this.externalEvents.push(externalEvent)
    })
  }
}
