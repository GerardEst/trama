import { Component } from '@angular/core'
import { UnavailableAnswerDisplay } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { AnswerDisplaySelectComponent } from 'src/app/shared/components/answer-display-select/answer-display-select.component'
import { normalizeLink } from 'src/app/shared/utils/normalizers'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ToggleComponent } from 'src/app/shared/components/ui/toggle/toggle.component'

/**
 * How the open story plays and what its readers see around it. The editor's story options
 * and the story's own page show these same controls.
 */
@Component({
  selector: 'polo-story-options',
  standalone: true,
  imports: [AnswerDisplaySelectComponent, ToggleComponent, TranslatePipe],
  templateUrl: './story-options.component.html',
  styleUrl: './story-options.component.css',
})
export class StoryOptionsComponent {
  constructor(
    public db: DatabaseService,
    public activeStory: ActiveStoryService,
    private mutations: StoryMutationService
  ) {}

  async toggleTracking() {
    if (this.db.authenticationRequired() || !this.activeStory.storyId()) return

    const tracking = !this.activeStory.storyConfiguration().tracking
    this.activeStory.patchConfiguration({ tracking })
    if (await this.mutations.ensureSaved()) this.db.setTrackingOf(this.activeStory.storyId(), tracking)
  }

  setAnswerDisplay(value: UnavailableAnswerDisplay | undefined) {
    this.mutations.update(tree => { tree.unavailableAnswerDisplay = value })
  }

  async toggleCumulativeMode() {
    const cumulativeMode = !this.activeStory.storyConfiguration().cumulativeMode
    this.activeStory.patchConfiguration({ cumulativeMode })
    if (await this.mutations.ensureSaved()) this.db.setCumulativeModeOf(this.activeStory.storyId(), cumulativeMode)
  }

  async toggleAppLink() {
    const tapLink = !this.activeStory.storyConfiguration().tapLink
    this.activeStory.patchConfiguration({ tapLink })
    if (await this.mutations.ensureSaved()) this.db.setTapLinkOf(this.activeStory.storyId(), tapLink)
  }

  async updateFooter(option: 'text' | 'link', event: Event) {
    let newValue = (event.target as HTMLInputElement).value
    if (option === 'link') {
      newValue = normalizeLink(newValue)
    }
    const footer = {
      ...this.activeStory.storyConfiguration().footer,
      [option]: newValue,
    }
    this.activeStory.patchConfiguration({ footer })
    if (!(await this.mutations.ensureSaved())) return
    this.db.updateFooterOf(this.activeStory.storyId(), {
      text: footer.text ?? '',
      link: footer.link ?? '',
    })
  }
}
