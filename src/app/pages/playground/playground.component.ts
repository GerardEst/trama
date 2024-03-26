import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FlowComponent } from 'src/app/components/flow/flow.component'
import { DatabaseService } from 'src/app/services/database.service'
import { ModalWindowComponent } from 'src/app/components/ui/modal-window/modal-window.component'
import { node, node_answer } from 'src/app/interfaces'
import { PlayService } from './services/play.service'
import { BasicButtonComponent } from 'src/app/components/basic-button/basic-button.component'
@Component({
  selector: 'polo-playground',
  standalone: true,
  imports: [
    CommonModule,
    ModalWindowComponent,
    FlowComponent,
    BasicButtonComponent,
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.sass'],
})
export class PlaygroundComponent {
  @Input() storyId: string = ''

  userName: string | null = null
  playerPath: Array<any> = []
  externalEvents: Array<any> = []
  gameId?: string
  gotUserInfo: boolean = false

  constructor(
    private db: DatabaseService,
    public playService: PlayService
  ) {}

  async ngOnInit(): Promise<void> {
    const story = await this.db.getTree(this.storyId)
    this.playService.story.set(story)

    if (!this.playService.story().askName) this.displayGame()
  }

  async displayGame(event?: Event) {
    event?.preventDefault()

    this.gotUserInfo = true

    if (this.playService.story().tracking) {
      this.startTabChangeDetection()
      this.startBlurWindowDetection()
    }

    if (this.playService.story().tracking) {
      this.gameId = self.crypto.randomUUID()

      // We upload an empty game
      // In case the user refresh(and uses the same name) it keeps the trace that something happened... 👀
      this.saveGame({})
    }
  }

  public setUserName(event: any) {
    this.playService.player.set({
      ...this.playService.player(),
      name: event.target.value,
    })
  }

  private async saveGame(result: any) {
    if (!this.gameId) return console.error('Cannot save adventure')

    const saved = await this.db.saveNewGameTo(
      this.gameId,
      this.playService.player().name || 'anonymous',
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
    if (this.playService.story().tracking) {
      console.log('Saving game')
      const userFinalStats = this.playService.player()
      this.saveGame(userFinalStats)
    }
  }

  selectAnswer(answer: node_answer) {
    if (this.playService.story().tracking) {
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
    if (this.playService.story().tracking) {
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
