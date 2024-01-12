import { Component, OnInit } from '@angular/core'
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

  constructor(private db: DatabaseService) {}

  ngOnInit(): void {
    this.loadAdventure()
  }

  setUserName(event: any) {
    this.userName = event.target?.value
  }

  startAdventure() {
    this.gotUserInfo = true
  }

  async getTree(treeId: number) {
    const tree = await this.db.getTree(treeId)

    return tree
  }

  async loadAdventure() {
    this.tracking = await this.db.getTrackingOf(21)
    const tree = await this.getTree(21)

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
  }
}
