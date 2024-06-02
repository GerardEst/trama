import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { Router } from '@angular/router'
import { SeparatorComponent } from '../ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { StadisticsService } from 'src/app/services/stadistics.service'

@Component({
  selector: 'polo-menu',
  standalone: true,
  imports: [CommonModule, SeparatorComponent, BasicButtonComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass'],
})
export class MenuComponent implements OnInit {
  fixedMenu: boolean = true
  stories?: Array<any>
  @Input() activeStoryId?: string
  @Output() onChangeTree: EventEmitter<any> = new EventEmitter()

  constructor(
    private db: DatabaseService,
    private router: Router,
    private stadistics: StadisticsService,
    public activeStory: ActiveStoryService
  ) {}

  async ngOnInit(): Promise<void> {
    this.stories = await this.db.getAllTreesForUser()
  }

  loadTree(treeId: number) {
    this.onChangeTree.emit(treeId)
  }

  async createNewTree() {
    const newTreeData = [
      {
        name: 'My new tree',
        tree: {
          nodes: [
            {
              id: 'node_0',
              left: 500,
              top: 5000,
            },
          ],
        },
        profile_id: this.db.user.id,
      },
    ]

    const newTree = await this.db.createNewTree(newTreeData)
    if (!newTree) {
      console.error("Can't create new tree")
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
    this.db.user = null
    this.activeStory.reset()
    this.stadistics.clean()
    localStorage.removeItem('polo-id')
    localStorage.removeItem('polo-activeNodes')

    this.router.navigate(['/login'])
  }

  toggleMenu() {
    this.fixedMenu = !this.fixedMenu
  }
}
