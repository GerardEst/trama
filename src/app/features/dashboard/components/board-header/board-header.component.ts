import { Component, EventEmitter, OnInit, Output, effect, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { StoryExportService } from 'src/app/shared/services/story-export.service'
import { EditableNameComponent } from 'src/app/shared/components/ui/editable-name/editable-name.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { tetherPopover } from 'src/app/shared/utils/popover-tether'

export interface StorySummary {
  id: string
  name: string
}

let nextId = 0

/**
 * Where the author is: Home, the way back to their stories, and the project being edited, which
 * they can rename or switch, with whether it is saved beside its name. A failed save explains itself,
 * with a way to retry or keep a copy, right under the header. What the project holds is in the
 * project panel; the person's settings are in the menu at the other corner. Until projects are
 * stored, each story is a project of its own.
 */
@Component({
  selector: 'polo-board-header',
  standalone: true,
  imports: [RouterLink, EditableNameComponent, BasicButtonComponent, TranslatePipe],
  templateUrl: './board-header.component.html',
  styleUrl: './board-header.component.css',
})
export class BoardHeaderComponent implements OnInit {
  readonly stories = signal<StorySummary[]>([])
  @Output() newStory = new EventEmitter<void>()

  readonly switcherId = `polo-story-switcher-${nextId++}`

  constructor(
    public db: DatabaseService,
    public activeStory: ActiveStoryService,
    public mutations: StoryMutationService,
    private storyExport: StoryExportService,
    private router: Router
  ) {
    // Renaming the story here renames it in the switcher too.
    effect(
      () => {
        const id = this.activeStory.storyId()
        const name = this.activeStory.storyName()
        this.stories.update((stories) =>
          stories.map((story) => (story.id === id && story.name !== name ? { ...story, name } : story))
        )
      },
      { allowSignalWrites: true }
    )
  }

  get saveState() {
    return this.mutations.saveState
  }

  ngOnInit() {
    const userId = this.db.user()?.id
    if (userId) this.loadStories(userId)
  }

  private async loadStories(userId: string) {
    this.stories.set((await this.db.getAllTreesForUser(userId)) ?? [])
  }

  // The menu is as wide as the header it hangs from. Measured only as it opens.
  openSwitcher(event: Event, bar: HTMLElement, switcher: HTMLElement) {
    if ((event as ToggleEvent).newState === 'open') switcher.style.width = `${bar.getBoundingClientRect().width}px`
    tetherPopover(event, bar, switcher)
  }

  rename(value: string) {
    return this.mutations.renameStory(value)
  }

  createStory(switcher: HTMLElement) {
    switcher.hidePopover()
    this.newStory.emit()
  }

  signInAgain() {
    this.router.navigate(['/login'])
  }

  // A failed save offers the story as a file, so nothing written is lost.
  exportTree() {
    if (!this.activeStory.storyId()) return
    try {
      this.storyExport.downloadJson()
    } catch (error: unknown) {
      console.error('Could not export the story', error)
    }
  }
}
