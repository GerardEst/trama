import {
  Component,
  Output,
  EventEmitter,
  effect,
  WritableSignal,
  signal,
  OnInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ModalService } from 'src/app/core/services/modal.service'
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ViewportService } from 'src/app/core/services/viewport.service'

@Component({
  selector: 'polo-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, BasicButtonComponent, TranslatePipe],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  fixedMenu: boolean = true
  public stories: WritableSignal<any> = signal([])
  @Output() onChangeTree: EventEmitter<any> = new EventEmitter()
  @Output() onNewStory: EventEmitter<any> = new EventEmitter()

  constructor(
    public db: DatabaseService,
    public activeStory: ActiveStoryService,
    private modal: ModalService,
    private viewport: ViewportService
  ) {
    // On phones the menu is a drawer that would cover the whole board.
    this.fixedMenu = !this.viewport.mobile()
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
    const userId = this.db.user()?.id
    if (userId) this.getTrees(userId)
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
    this.closeDrawer()
    this.onChangeTree.emit(treeId)
  }

  createNewTree() {
    this.closeDrawer()
    this.onNewStory.emit()
  }

  // Leave the board visible once the author has picked where to go.
  private closeDrawer() {
    if (this.viewport.mobile()) this.fixedMenu = false
  }

  toggleMenu() {
    this.fixedMenu = !this.fixedMenu
  }

  openProfile() {
    this.modal.launch(ProfileModalComponent)
  }
}
