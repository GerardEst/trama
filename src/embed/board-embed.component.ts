import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  untracked,
  ViewEncapsulation,
} from '@angular/core'
import { tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { BoardComponent } from 'src/app/features/board/board.component'
import { FrameColorsService } from 'src/app/features/board/services/frame-colors.service'
import { StoryEditorService } from 'src/app/features/board/services/story-editor.service'
import { StoryReferencesService } from 'src/app/features/board/services/story-references.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { STORY_IMAGE_URL } from 'src/app/shared/components/ui/image/story-image-url'
import { StoryImagesService } from 'src/app/shared/services/story-images.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { EmbedDatabaseService, EmbedStoryImagesService, EmbedStoryMutationService } from './embed-services'

/**
 * One live board for the public site: the real board and nodes, with a story of
 * its own. Every service that holds story state is provided here, so each demo
 * on a page edits only its own copy, and nothing is saved anywhere.
 */
@Component({
  selector: 'polo-board-embed',
  standalone: true,
  imports: [BoardComponent],
  // The site's styles stay out and the app's stay in; the theme's custom
  // properties still inherit through the shadow root, so the board takes the page's look.
  encapsulation: ViewEncapsulation.ShadowDom,
  styleUrls: ['../styles.css', './board-embed.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ActiveStoryService,
    StoryEditorService,
    StoryReferencesService,
    FrameColorsService,
    { provide: StoryMutationService, useClass: EmbedStoryMutationService },
    { provide: StoryImagesService, useClass: EmbedStoryImagesService },
    { provide: DatabaseService, useClass: EmbedDatabaseService },
    // An example's pictures are the page's own files, already full addresses.
    { provide: STORY_IMAGE_URL, useValue: (path: string) => path },
  ],
  template: `
    <polo-board
      [embedded]="true"
      [grid]="false"
      [zoomable]="false"
      [focusElements]="false"
      [edgePan]="false"
      [initialZoom]="zoom"
      [initialPosition]="{ x: x, y: y }"
    />
  `,
})
export class BoardEmbedComponent implements OnInit, OnDestroy {
  @Input() story: Partial<tree> = { nodes: [], refs: {}, categories: [] }
  @Input() zoom = 1
  @Input() x = 0
  @Input() y = 0

  private readonly activeStory = inject(ActiveStoryService)
  private readonly host = inject(ElementRef<HTMLElement>)
  private initialTree?: object
  private readonly zone = inject(NgZone)
  private visibility?: IntersectionObserver

  constructor() {
    // The page plays the edited story with the engine, so it hears every change.
    effect(() => {
      const current = this.activeStory.entireTree()
      if (!this.initialTree || current === this.initialTree) return
      untracked(() =>
        this.host.nativeElement.dispatchEvent(
          new CustomEvent('trama-change', { detail: current, bubbles: true, composed: true })
        )
      )
    })
  }

  /** The story as the board has it now, with every edit. */
  currentStory(): tree {
    return this.activeStory.entireTree()
  }

  ngOnInit() {
    this.activeStory.load('demo', 'Demo', structuredClone(this.story))
    this.initialTree = this.activeStory.entireTree()
    // Full-screen dialogs (focus mode) are laid over the board instead of the page:
    // the host publishes its rectangle, and only while it is on screen.
    this.zone.runOutsideAngular(() => {
      this.visibility = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) this.listen()
        else this.unlisten()
      })
      this.visibility.observe(this.host.nativeElement)
    })
  }

  ngOnDestroy() {
    this.visibility?.disconnect()
    this.unlisten()
  }

  private readonly publishRect = () => {
    const rect = this.host.nativeElement.getBoundingClientRect()
    const style = this.host.nativeElement.style
    style.setProperty('--embed-top', `${rect.top}px`)
    style.setProperty('--embed-left', `${rect.left}px`)
    style.setProperty('--embed-width', `${rect.width}px`)
    style.setProperty('--embed-height', `${rect.height}px`)
  }

  private listen() {
    this.publishRect()
    addEventListener('scroll', this.publishRect, { passive: true })
    addEventListener('resize', this.publishRect)
  }

  private unlisten() {
    removeEventListener('scroll', this.publishRect)
    removeEventListener('resize', this.publishRect)
  }
}
