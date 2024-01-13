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
  userName: string = ''
  treeId: number = 0
  @Input() set id(treeId: number) {
    this.treeId = treeId
  }

  constructor(private db: DatabaseService) {}

  ngOnInit(): void {
    this.getTreeConfiguration(this.treeId)
    this.loadAdventure(this.treeId)
  }

  setUserName(event: any) {
    this.userName = event.target?.value
  }

  startAdventure() {
    this.gotUserInfo = true
  }

  async getTreeConfiguration(treeId: number) {
    this.tracking = await this.db.getTrackingOf(treeId)
  }

  async loadAdventure(treeId: number) {
    const tree = await this.db.getTree(treeId)

    const adventure = new Marco({
      domPlace: '.adventure', // El lloc del DOM on es crearà la interacció
      guidebook: tree, // ⚠ Guia on es defineix tot lo relatiu a l'aventura
      config: {
        showLockedAnswers: true,
      },
      character: {
        name: 'User',
      },
    })

    adventure.start()

    adventure.onWin = (event: any) => {
      if (this.tracking) {
        const userFinalStats = adventure.getAllStats()
        this.saveGame(userFinalStats)
      }
    }

    adventure.onAlterStat = (event: any) => {
      console.log('Stat altered', event)
    }
  }

  async saveGame(result: any) {
    console.log(result)
    const newUserId = await this.db.saveNewAnonymousUser(this.userName)
    this.db.saveNewGameTo(newUserId, this.treeId, result)
  }
}
