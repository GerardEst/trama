import { Component, Output, EventEmitter, Input, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/core/services/database.service'
import { SeparatorComponent } from '../../../../shared/components/ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ProfileComponent } from '../profile/profile.component'
import { ModalService } from 'src/app/shared/services/modal.service'
import { CreatorPaywallComponent } from 'src/app/features/dashboard/modals/creator-paywall/creator-paywall.component'
import { PanzoomService } from 'src/app/shared/services/panzoom.service'

@Component({
  selector: 'polo-menu',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent, ProfileComponent],
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
    private modal: ModalService,
    private panzoom: PanzoomService
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

    this.panzoom.goTo(-5000, -5000)

    this.loadTree(newTree[0].id)
  }

  toggleMenu() {
    this.fixedMenu = !this.fixedMenu
  }
}
