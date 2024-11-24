import { Component } from '@angular/core'
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
  imports: [BasicButtonComponent, DeleteStoryComponent],
  templateUrl: './menu-top.component.html',
  styleUrl: './menu-top.component.sass',
})
export class MenuTopComponent {
  showOptions: boolean = false
  savingTree = false

  takenCustomId = false

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

    this.activeStory.storyName.set(newName)
  }

  toggleOptions() {
    this.showOptions = !this.showOptions
  }

  toggleTracking() {
    if (this.db.user().profile.subscription_status !== 'active') return

    this.activeStory.storyConfiguration().tracking =
      !this.activeStory.storyConfiguration().tracking
    this.db.setTrackingOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().tracking
    )
  }

  toggleSharing() {
    this.activeStory.storyConfiguration().sharing =
      !this.activeStory.storyConfiguration().sharing
    this.db.setSharingOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().sharing
    )
  }

  toggleCumulativeMode() {
    this.activeStory.storyConfiguration().cumulativeMode =
      !this.activeStory.storyConfiguration().cumulativeMode
    this.db.setCumulativeModeOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().cumulativeMode
    )
  }

  toggleTextandplayLink() {
    this.activeStory.storyConfiguration().tapLink =
      !this.activeStory.storyConfiguration().tapLink
    this.db.setTapLinkOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().tapLink
    )
  }

  async updateCustomId(event: any) {
    this.activeStory.storyConfiguration().customId = event.target.value

    const couldUpdate = await this.db.updateCustomIdOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().customId || ''
    )
    this.takenCustomId = !couldUpdate
  }

  updateFooter(option: 'text' | 'link', event: any) {
    let newValue = event.target.value
    if (option === 'link') {
      newValue = normalizeLink(newValue)
    }
    this.activeStory.storyConfiguration().footer[option] = newValue
    this.db.updateFooterOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().footer
    )
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
      // User confirmed deletion
      await this.db.deleteStory(this.activeStory.storyId())
      // Optionally, navigate to a different page or update UI
      window.location.reload()
    }
    // If result is false, do nothing (user cancelled)
  }

  closePopup() {
    this.showOptions = false
  }
}
