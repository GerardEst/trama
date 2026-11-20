import { Component, Input, output } from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ViewportService } from 'src/app/core/services/viewport.service'
import { StoryReferencesComponent } from '../story-references/story-references.component'
import { StadisticsLayerComponent } from '../stadistics-layer/stadistics-layer.component'
import { ContextHelpComponent } from 'src/app/shared/context-help/context-help.component'

export const STORY_PANEL_ID = 'story-panel'

/**
 * The project panel, down the left side of the board: the project the open story belongs to, with
 * its stories, characters and locations, and what this story holds, its references and the games
 * played. Projects are not stored yet, so it lists this story alone and the rest is coming soon.
 * It opens and closes from the board's controls; on phones it covers the board.
 */
@Component({
  selector: 'polo-story-panel',
  standalone: true,
  imports: [TranslatePipe, StoryReferencesComponent, StadisticsLayerComponent, ContextHelpComponent],
  templateUrl: './story-panel.component.html',
  styleUrl: './story-panel.component.css',
})
export class StoryPanelComponent {
  @Input() open = false
  readonly closed = output<void>()
  readonly panelId = STORY_PANEL_ID
  mode: 'refs' | 'games' = 'refs'

  constructor(
    public activeStory: ActiveStoryService,
    public viewport: ViewportService
  ) {}
}
