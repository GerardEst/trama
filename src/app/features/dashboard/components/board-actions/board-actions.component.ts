import { Component, Input, output } from '@angular/core'
import { Router } from '@angular/router'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ViewportService } from 'src/app/core/services/viewport.service'
import { tetherPopover } from 'src/app/shared/utils/popover-tether'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'

let nextId = 0

/**
 * What the author does with the story, at the top right of the board: try it, share it (the one
 * main action), its analytics and its options. The person's own account is a step away, at Home.
 * Phones keep trying and sharing as icons and fold the rest into one menu.
 */
@Component({
  selector: 'polo-board-actions',
  standalone: true,
  imports: [BasicButtonComponent, TranslatePipe],
  templateUrl: './board-actions.component.html',
  styleUrl: './board-actions.component.css',
})
export class BoardActionsComponent {
  /** The preview is open beside the board, so its button would only repeat it. */
  @Input() previewOpen = false
  readonly previewRequested = output<void>()
  readonly shareRequested = output<void>()
  readonly optionsRequested = output<void>()

  readonly moreId = `polo-board-more-${nextId++}`
  readonly tether = tetherPopover

  constructor(
    public activeStory: ActiveStoryService,
    public viewport: ViewportService,
    private router: Router,
    private mutations: StoryMutationService
  ) {}

  /** An example not stored yet has no games, nor a page of its own to show them. */
  analyticsDisabled() {
    return !this.activeStory.storyId() || this.mutations.isDraft()
  }

  openAnalytics() {
    this.router.navigate(['/story', this.activeStory.storyId(), 'statistics'])
  }
}
