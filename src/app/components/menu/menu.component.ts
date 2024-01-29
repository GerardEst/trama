import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  effect,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { Router } from '@angular/router'
import { SeparatorComponent } from '../ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Component({
  selector: 'polo-menu',
  standalone: true,
  imports: [CommonModule, SeparatorComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass'],
})
export class MenuComponent implements OnInit {
  stories?: Array<any>
  @Input() activeStoryId?: string
  @Output() onChangeTree: EventEmitter<any> = new EventEmitter()

  constructor(
    private db: DatabaseService,
    private router: Router,
    public activeStory: ActiveStoryService
  ) {
    effect(() => {
      if (activeStory.storyName()) {
        // Detectem sempre que storyName cambia i així fem update de stories
        // trobem la activa i li cambiem el nom
        console.log(this.stories)
      }
    })
  }

  /** Al menu s'hi carreguen unes histories que venen de la db
   * D'aquestes histories n'hi ha una que és la activa,
   * que la sabem perque tenim activeStoryId, però podriem
   * saber-ho per un servei compartit de activeStory on guardar
   * l'id, el nom, el track etc en signals
   *
   *
   */

  async ngOnInit(): Promise<void> {
    this.stories = await this.db.getAllTrees()
  }

  loadTree(treeId: number) {
    this.onChangeTree.emit(treeId)
  }

  async createNewTree() {
    const newTreeData = [
      {
        name: 'My new tree',
        tree: {
          name: 'Starter',
          nodes: [
            {
              id: 'node_0',
              left: 500,
              top: 5000,
            },
          ],
        },
      },
    ]

    const newTree = await this.db.createNewTree(newTreeData)
    if (!newTree) {
      console.warn("Can't create new tree")
      return
    }

    this.stories?.push({
      id: newTree[0].id,
      name: newTree[0].name,
    })
    this.loadTree(newTree[0].id)
  }

  logout() {
    this.db.supabase.auth.signOut()
    this.router.navigate(['/login'])
  }
}
