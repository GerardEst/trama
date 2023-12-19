import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from './components/board/board.component'
import { MenuComponent } from './components/menu/menu.component'
import { DatabaseService } from './services/database.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BoardComponent, MenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  tree?: any
  id?: number

  constructor(private db: DatabaseService) {}

  ngOnInit(): void {
    this.initBoard()
  }

  async loadTree(treeId: number) {
    this.tree = await this.db.getTree(treeId)

    localStorage.setItem('polo-id', treeId.toString())
    localStorage.setItem('polo-tree', JSON.stringify(this.tree))
  }

  initBoard() {
    // When there is local data, we use it
    if (localStorage.getItem('polo-id') && localStorage.getItem('polo-tree')) {
      //@ts-ignore
      const storedTree = JSON.parse(localStorage.getItem('polo-tree'))
      //@ts-ignore
      const storedTreeId = JSON.parse(localStorage.getItem('polo-id'))

      this.id = storedTreeId
      this.tree = storedTree

      return
    }

    this.tree = {
      name: 'Starter',
      nodes: [
        {
          id: 'node_0',
          left: 200,
          top: 200,
        },
      ],
    }
  }
}
