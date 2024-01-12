import { Component, OnInit, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
/** Load ✨marco✨ */
//@ts-ignore
import { Marco } from '../../modules/marco/Marco.js'
import { DatabaseService } from 'src/app/services/database.service'

@Component({
  selector: 'polo-playground',
  standalone: true,
  imports: [CommonModule],
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
      /** Aqui es on hauria de pillar els stats de l'heroi i penjar-los
       * Necessitaria una manera d'obtenir els stats de l'heroi a marco
       * tipo adventure.getAllStats() o algo així
       */
      const userFinalStats = adventure.getAllStats()
      console.log(userFinalStats)
    }

    adventure.onAlterStat = (event: any) => {
      console.log('Stat altered', event)
    }
  }
}
