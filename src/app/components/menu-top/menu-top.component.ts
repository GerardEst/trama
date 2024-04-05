import { Component, Input } from '@angular/core'
import { DatabaseService } from 'src/app/services/database.service'
import { Router } from '@angular/router'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
@Component({
  selector: 'polo-menu-top',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './menu-top.component.html',
  styleUrl: './menu-top.component.sass',
})
export class MenuTopComponent {
  options = false
  savingTree = false

  constructor(
    private db: DatabaseService,
    private router: Router,
    public activeStory: ActiveStoryService
  ) {}

  async updateStoryName($event: any) {
    const storyId = this.activeStory.storyId()
    const newName = $event.target.value.trim()
    if (!storyId || newName.length === 0) return

    this.activeStory.storyName.set(newName)

    await this.db.saveNewStoryName(storyId, $event.target.value)
  }

  toggleOptions() {
    this.options = !this.options
  }

  toggleTracking() {
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

  toggleCumulativeView() {
    this.activeStory.storyConfiguration().cumulativeView =
      !this.activeStory.storyConfiguration().cumulativeView
    this.db.setCumulativeViewOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().cumulativeView
    )
  }

  toggleAskName() {
    this.activeStory.storyConfiguration().askName =
      !this.activeStory.storyConfiguration().askName
    this.db.setAskNameOf(
      this.activeStory.storyId(),
      this.activeStory.storyConfiguration().askName
    )
  }

  async openStadistics() {
    this.router.navigate(['/stadistics', this.activeStory.storyId()])
  }

  exportTree() {
    navigator.clipboard.writeText(this.activeStory.storyId())
  }

  deleteTree() {
    this.db.deleteStory(this.activeStory.storyId())
  }
}
