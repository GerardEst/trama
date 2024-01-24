import { Component, OnInit, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
/** Load ✨marco✨ */
//@ts-ignore
import { Marco } from '../../modules/marco/Marco'
import { DatabaseService } from 'src/app/services/database.service'
import { ModalWindowComponent } from 'src/app/components/ui/modal-window/modal-window.component'

@Component({
  selector: 'polo-playground',
  standalone: true,
  imports: [CommonModule, ModalWindowComponent],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.sass'],
})
export class PlaygroundComponent implements OnInit {
  gotUserInfo: boolean = false
  endGame: boolean = false

  userName: string = ''
  playerPath: Array<any> = []
  externalEvents: Array<any> = []

  treeId: number = 0
  tree: any

  adventure: any

  @Input() set id(treeId: number) {
    this.treeId = treeId
  }

  constructor(private db: DatabaseService) {}

  async ngOnInit(): Promise<void> {
    this.tree = await this.db.getTree(this.treeId)

    if (!this.tree.tracking) this.startAdventure()
  }

  setUserName(event: any) {
    this.userName = event.target?.value
  }

  startAdventure() {
    this.gotUserInfo = true
    this.loadAdventure()
  }

  async loadAdventure() {
    this.adventure = new Marco({
      domPlace: '.adventure',
      guidebook: this.tree.tree, // ⚠ Guia on es defineixen els nodes
      config: {
        showLockedAnswers: true,
        view: this.tree.view || 'normal',
      },
      player: {
        name: this.userName,
      },
    })

    this.adventure.start()
    this.startTabChangeDetection()
    this.startBlurWindowDetection()

    this.adventure.onWin = (event: any) => {
      if (this.tree.tracking) {
        const userFinalStats = this.adventure.getAllStats()
        this.saveGame(userFinalStats)
      }
      this.endGame = true
      console.log(this.playerPath)
    }
    this.adventure.onEnd = (event: any) => {
      if (this.tree.tracking) {
        const userFinalStats = this.adventure.getAllStats()
        this.saveGame(userFinalStats)
      }
      this.endGame = true
      console.log(this.playerPath)
    }
    this.adventure.onSelectAnswer = (answer: any) => {
      if (this.tree.tracking) {
        this.playerPath.push({
          type: 'answer',
          id: answer.id,
          text: answer.text,
          timestamp: Date.now,
        })
      }
    }
    this.adventure.onDrawNode = (node: any) => {
      if (this.tree.tracking) {
        this.playerPath.push({
          type: 'node',
          id: node.id,
          text: node.text,
          timestamp: Date.now,
        })
      }
    }
    this.adventure.onAlterCondition = (event: any) => {
      console.log(this.adventure.getAllStats())
    }
    this.adventure.onExternalEvent = (event: any) => {
      console.log(event)
    }
  }

  async saveGame(result: any) {
    const saved = await this.db.saveNewGameTo(
      this.userName,
      this.treeId,
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
