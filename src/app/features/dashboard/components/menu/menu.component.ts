import {
  Component,
  Output,
  EventEmitter,
  effect,
  WritableSignal,
  signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ModalService } from 'src/app/core/services/modal.service'
import { CreatorPaywallComponent } from 'src/app/features/dashboard/modals/creator-paywall/creator-paywall.component'
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component'
import { FeedbackModalComponent } from 'src/app/features/feedback/feedback-modal/feedback-modal.component'

@Component({
  selector: 'polo-menu',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass'],
})
export class MenuComponent {
  fixedMenu: boolean = true
  public stories: WritableSignal<any> = signal([])
  @Output() onChangeTree: EventEmitter<any> = new EventEmitter()
  @Output() onNewStory: EventEmitter<any> = new EventEmitter()

  isSubscribedUser = () =>
    this.db.user().profile.subscription_status === 'active'

  constructor(
    public db: DatabaseService,
    public activeStory: ActiveStoryService,
    private modal: ModalService
  ) {
    effect(
      () => {
        this.changeStoryName(
          this.activeStory.storyId(),
          this.activeStory.storyName()
        )
      },
      { allowSignalWrites: true }
    )
  }

  ngOnInit() {
    this.getTrees(this.db.user().id)
  }

  async getTrees(userId: string) {
    this.stories.set(await this.db.getAllTreesForUser(userId))
  }

  changeStoryName(storyId: string, storyName: string) {
    this.stories.update((currentStories) =>
      currentStories.map((story: any) => {
        if (story.id === storyId) {
          story.name = storyName
        }
        return story
      })
    )
  }

  loadTree(treeId: number) {
    this.onChangeTree.emit(treeId)
  }

  createNewTree() {
    if (
      !this.isSubscribedUser() &&
      this.stories() &&
      this.stories().length >= 3
    ) {
      this.modal.launch(CreatorPaywallComponent)
      console.error('Cannot have more than 3 stories if not subscribed')
      return
    }
    this.onNewStory.emit()
  }

  toggleMenu() {
    this.fixedMenu = !this.fixedMenu
  }

  openProfile() {
    this.modal.launch(ProfileModalComponent)
  }

  openFeedbackModal() {
    this.modal.launch(FeedbackModalComponent)
  }
}
