import { Component, OnInit, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
/** Load ✨marco✨ */
//@ts-ignore
import { Marco } from '../../modules/marco/Marco.js'
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
  gotUserInfo: boolean = false
  endGame: boolean = false
  userName: string = ''
  treeId: number = 0
  @Input() set id(treeId: number) {
    this.treeId = treeId
  }

  constructor(private db: DatabaseService) {}

  ngOnInit(): void {
    this.getTreeConfiguration(this.treeId)
  }

  setUserName(event: any) {
    this.userName = event.target?.value
  }

  startAdventure() {
    this.loadAdventure(this.treeId, this.userName)
    this.gotUserInfo = true
  }

  async getTreeConfiguration(treeId: number) {
    this.tracking = await this.db.getTrackingOf(treeId)
  }

  async loadAdventure(treeId: number, playerName: string) {
    const tree = await this.db.getTree(treeId)

    const adventure = new Marco({
      domPlace: '.adventure', // El lloc del DOM on es crearà la interacció
      guidebook: tree, // ⚠ Guia on es defineix tot lo relatiu a l'aventura
      config: {
        showLockedAnswers: true,
      },
      character: {
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
    }
    adventure.onEnd = (event: any) => {
      if (this.tracking) {
        const userFinalStats = adventure.getAllStats()
        this.saveGame(userFinalStats)
      }
      this.endGame = true
    }
  }

  async saveGame(result: any) {
    const newUserId = await this.db.saveNewAnonymousUser(this.userName)
    const saved = await this.db.saveNewGameTo(newUserId, this.treeId, result)
    if (saved) {
      console.log('Game saved!', saved)
    } else {
      console.error('Error saving game')
    }
  }
}
