import { Component, Output, EventEmitter } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'
import { Router } from '@angular/router'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { normalizeLink } from 'src/app/shared/utils/normalizers'
import { AlertService } from 'src/app/core/services/alert.service'
import { DeleteStoryComponent } from '../delete-story/delete-story.component'

@Component({
  selector: 'polo-menu-top',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './menu-top.component.html',
  styleUrl: './menu-top.component.sass',
})
export class MenuTopComponent {
  showOptions: boolean = false
  savingTree = false
  takenCustomId = false

  @Output() onDeleteStory: EventEmitter<any> = new EventEmitter()

  constructor(
    public db: DatabaseService,
    private router: Router,
    public activeStory: ActiveStoryService,
    private alertService: AlertService
  ) {}

  async updateStoryName($event: any) {
    const storyId = this.activeStory.storyId()
    const newName = $event.target.value.trim()
    if (!storyId || newName.length === 0) return

    await this.db.saveNewStoryName(storyId, $event.target.value)

    this.activeStory.setStoryName(newName)
  }

  toggleOptions() {
    this.showOptions = !this.showOptions
  }

  toggleTracking() {
    if (this.db.user()?.profile.subscription_status !== 'active') return

    const tracking = !this.activeStory.storyConfiguration().tracking
    this.activeStory.patchConfiguration({ tracking })
    this.db.setTrackingOf(this.activeStory.storyId(), tracking)
  }

  toggleSharing() {
    const sharing = !this.activeStory.storyConfiguration().sharing
    this.activeStory.patchConfiguration({ sharing })
    this.db.setSharingOf(this.activeStory.storyId(), sharing)
  }

  toggleCumulativeMode() {
    const cumulativeMode = !this.activeStory.storyConfiguration().cumulativeMode
    this.activeStory.patchConfiguration({ cumulativeMode })
    this.db.setCumulativeModeOf(this.activeStory.storyId(), cumulativeMode)
  }

  toggleAppLink() {
    const tapLink = !this.activeStory.storyConfiguration().tapLink
    this.activeStory.patchConfiguration({ tapLink })
    this.db.setTapLinkOf(this.activeStory.storyId(), tapLink)
  }

  async updateCustomId(event: any) {
    const customId = event.target.value
    this.activeStory.patchConfiguration({ customId })

    const couldUpdate = await this.db.updateCustomIdOf(
      this.activeStory.storyId(),
      customId
    )
    this.takenCustomId = !couldUpdate
  }

  updateFooter(option: 'text' | 'link', event: any) {
    let newValue = event.target.value
    if (option === 'link') {
      newValue = normalizeLink(newValue)
    }
    const footer = {
      ...this.activeStory.storyConfiguration().footer,
      [option]: newValue,
    }
    this.activeStory.patchConfiguration({ footer })
    this.db.updateFooterOf(this.activeStory.storyId(), {
      text: footer.text ?? '',
      link: footer.link ?? '',
    })
  }

  async openStadistics() {
    this.router.navigate(['/stadistics', this.activeStory.storyId()])
  }

  exportTree() {
    navigator.clipboard.writeText(this.activeStory.storyId())
  }

  async deleteTree() {
    const result = await this.alertService.launch(DeleteStoryComponent)

    if (result) {
      this.onDeleteStory.emit(this.activeStory.storyId())
      this.closePopup()
    }
  }

  closePopup() {
    this.showOptions = false
  }
}
