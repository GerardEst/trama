import { Component } from '@angular/core'
import { ModalWindowComponent } from 'src/app/components/ui/modal-window/modal-window.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { DatabaseService } from 'src/app/services/database.service'
import { BasicButtonComponent } from '../../components/ui/basic-button/basic-button.component'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'polo-share-story',
  standalone: true,
  imports: [ModalWindowComponent, BasicButtonComponent],
  templateUrl: './share-story.component.html',
  styleUrl: './share-story.component.sass',
})
export class ShareStoryComponent {
  takenCustomId = false
  environment = environment
  copiedLinks = {
    private: false,
    custom: false,
  }

  constructor(
    public activeStory: ActiveStoryService,
    private db: DatabaseService
  ) {}

  async updateCustomId(event: any) {
    this.activeStory.storyConfiguration().customId = event.target.value

    const couldUpdate = await this.db.updateCustomIdOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().customId || ''
    )
    this.takenCustomId = !couldUpdate
  }
  cleanCustomId() {
    this.activeStory.storyConfiguration().customId = undefined
  }

  copyLink(type: 'custom' | 'private') {
    const url =
      environment.baseRoute +
      (type === 'custom'
        ? '/' + this.activeStory.storyConfiguration().customId
        : '/private/' + this.activeStory.storyId())

    navigator.clipboard.writeText(url)
    this.copiedLinks[type] = true
    setTimeout(() => {
      this.copiedLinks[type] = false
    }, 1000)
  }
}
