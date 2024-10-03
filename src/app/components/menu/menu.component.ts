import { Component, Output, EventEmitter, Input, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/services/database.service'
import { SeparatorComponent } from '../ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { ProfileComponent } from '../profile/profile.component'
import { ModalService } from 'src/app/services/modal.service'
import { CreatorPaywallComponent } from '../modals/creator-paywall/creator-paywall.component'

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
  @Output() onChangeTree: EventEmitter<any> = new EventEmitter()

  isSubscribedUser = () =>
    this.db.user().profile.subscription_status === 'active'

  constructor(
    private db: DatabaseService,
    public activeStory: ActiveStoryService,
    private modal: ModalService
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
    if (!this.isSubscribedUser() && this.stories && this.stories.length >= 3) {
      this.modal.launch(CreatorPaywallComponent)
      console.error('Cannot have more than 3 stories if not subscribed')
      return
    }

    const newTreeData = [
      {
        name: 'My new tree',
        tree: {
          nodes: [],
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
