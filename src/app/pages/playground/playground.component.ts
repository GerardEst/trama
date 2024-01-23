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
  tracking: boolean = false
  view: string | null = null
  gotUserInfo: boolean = false
  endGame: boolean = false
  userName: string = ''
  treeId: number = 0
  playerPath: Array<any> = []

  @Input() set id(treeId: number) {
    this.treeId = treeId
  }

  constructor(private db: DatabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.getTreeConfiguration(this.treeId)
    if (!this.tracking) this.startAdventure()
  }

  setUserName(event: any) {
    this.userName = event.target?.value
  }

  startAdventure() {
    this.loadAdventure(this.treeId, this.userName)
    this.gotUserInfo = true
  }

  async getTreeConfiguration(treeId: number) {
    // TODO -> Aixo es podria obtenir al mateix getTree no?
    const configuration = await this.db.getConfigurationOf(treeId)

    this.tracking = configuration.tracking
    this.view = configuration.view
  }

  async loadAdventure(treeId: number, playerName: string) {
    const tree = await this.db.getTree(treeId)

    const adventure = new Marco({
      domPlace: '.adventure', // El lloc del DOM on es crearà la interacció
      guidebook: tree, // ⚠ Guia on es defineix tot lo relatiu a l'aventura
      config: {
        showLockedAnswers: true,
        view: this.view || 'normal',
      },
      player: {
        name: playerName,
      },
    })

    adventure.start()

    adventure.onWin = (event: any) => {
      if (this.tracking) {
        const userFinalStats = adventure.getAllStats()
        this.saveGame(userFinalStats)
      }
      this.endGame = true
      console.log(this.playerPath)
    }
    adventure.onEnd = (event: any) => {
      if (this.tracking) {
        const userFinalStats = adventure.getAllStats()
        this.saveGame(userFinalStats)
      }
      this.endGame = true
      console.log(this.playerPath)
    }
    adventure.onSelectAnswer = (answer: any) => {
      if (this.tracking) {
        this.playerPath.push({
          type: 'answer',
          id: answer.id,
          text: answer.text,
        })
      }
    }
    adventure.onDrawNode = (node: any) => {
      if (this.tracking) {
        this.playerPath.push({
          type: 'node',
          id: node.id,
          text: node.text,
        })
      }
    }
    adventure.onAlterCondition = (event: any) => {
      console.log(adventure.getAllStats())
    }
  }

  async saveGame(result: any) {
    const saved = await this.db.saveNewGameTo(
      this.userName,
      this.treeId,
      this.playerPath,
      result
    )
    if (saved) {
      console.log('Game saved!', saved)
    } else {
      console.error('Error saving game')
    }
  }
}
