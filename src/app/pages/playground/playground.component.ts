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
  constructor(private db: DatabaseService) {}

  ngOnInit(): void {
    this.loadAdventure()
  }

  async getTree(treeId: number) {
    const tree = await this.db.getTree(treeId)

    return tree
  }

  async loadAdventure() {
    const tree = await this.getTree(21)

    const adventure = new Marco({
      domPlace: '.adventure', // El lloc del DOM on es crearà la interacció
      guidebook: tree, // ⚠ Guia on es defineix tot lo relatiu a l'aventura
      config: {
        defaultJournalEntries: true,
        showLockedAnswers: true,
      },
      character: {
        name: 'Hero',
        level: 0,
        exp: 0,
      },
    })

    adventure.start()
  }
}
