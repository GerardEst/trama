import { Component, Output, EventEmitter, Input, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { SeparatorComponent } from '../ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { ProfileComponent } from '../profile/profile.component'

@Component({
  selector: 'polo-menu',
  standalone: true,
  imports: [
    CommonModule,
    SeparatorComponent,
    BasicButtonComponent,
    ProfileComponent,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass'],
})
export class MenuComponent {
  fixedMenu: boolean = true
  stories?: Array<any>
  @Input() activeStoryId?: string
  @Output() onChangeTree: EventEmitter<any> = new EventEmitter()

  constructor(
    private db: DatabaseService,
    public activeStory: ActiveStoryService
  ) {
    effect(() => {
      this.activeStory.storyName()
      this.getTrees(this.db.user().id)
    })
  }

  async getTrees(userId: string) {
    this.stories = await this.db.getAllTreesForUser(userId)
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
        profile_id: this.db.user().id,
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

  toggleMenu() {
    this.fixedMenu = !this.fixedMenu
  }
}
