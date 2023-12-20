import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'

interface treeInfo {
  id: number
  name: string
}
@Component({
  selector: 'polo-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass'],
})
export class MenuComponent implements OnInit {
  trees?: Array<treeInfo>
  @Input() treeId?: number
  @Output() onChangeTree: EventEmitter<any> = new EventEmitter()

  constructor(private db: DatabaseService) {}

  async ngOnInit(): Promise<void> {
    this.trees = await this.db.getAllTrees()
  }

  loadTree(treeId: number) {
    this.onChangeTree.emit(treeId)
  }

  async createNewTree() {
    const newTree = await this.db.createNewTree()
    if (!newTree) {
      console.warn("Can't create new tree")
      return
    }

    this.trees?.push({
      id: newTree[0].id,
      name: newTree[0].name,
    })
    this.loadTree(newTree[0].id)
  }
}
