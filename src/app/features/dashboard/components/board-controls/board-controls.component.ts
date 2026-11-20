import { Component, ElementRef, Input, ViewChild, computed, inject, output } from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ViewportService } from 'src/app/core/services/viewport.service'
import { STORY_PANEL_ID } from '../story-panel/story-panel.component'
import { tetherPopover } from 'src/app/shared/utils/popover-tether'
import type { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { SITE_PAGES, siteUrl } from 'src/app/core/site-links'

export type CreatableNodeType = 'content' | 'text' | 'distributor' | 'end'

export type BoardViewRequest = 'zoomIn' | 'zoomOut' | 'zoomReset' | 'fit' | 'start'

/** The most used first: a passage with answers, then free text, routes and endings. */
const CREATABLE_NODE_TYPES: readonly CreatableNodeType[] = ['content', 'text', 'distributor', 'end']

const SHORTCUTS = ['create', 'select', 'pan', 'zoom', 'undo', 'duplicate', 'remove', 'image', 'group', 'frame', 'panel', 'help'] as const

let nextId = 0

/**
 * The board's own controls, along its foot: on the left the project panel and the history, in the
 * middle a button per kind of node, and on the right the view (zoom, the whole story, Start) and the
 * keyboard shortcuts. Phones pinch to zoom, so they keep the left group and one button that offers
 * the kinds of node.
 */
@Component({
  selector: 'polo-board-controls',
  standalone: true,
  imports: [BasicButtonComponent, TranslatePipe],
  templateUrl: './board-controls.component.html',
  styleUrl: './board-controls.component.css',
})
export class BoardControlsComponent {
  @Input() sidebarOpen = false
  /** The board's zoom, as a percentage. */
  @Input() zoom = 100
  readonly sidebarToggled = output<void>()
  readonly historyRequested = output<'undo' | 'redo'>()
  readonly createRequested = output<CreatableNodeType>()
  readonly createMenuRequested = output<void>()
  readonly viewRequested = output<BoardViewRequest>()

  @ViewChild('shortcutsPanel') shortcutsPanel?: ElementRef<HTMLElement>

  readonly panelId = STORY_PANEL_ID
  readonly nodeTypes = CREATABLE_NODE_TYPES
  readonly shortcuts = SHORTCUTS
  readonly shortcutsId = `polo-board-shortcuts-${nextId++}`
  readonly tether = tetherPopover
  private readonly i18n = inject(I18nService)
  /** The guide is a page of the public site, so a plain address rather than a route. */
  readonly docsUrl = computed(() => siteUrl(this.i18n.lang(), SITE_PAGES.features))

  constructor(
    public activeStory: ActiveStoryService,
    public viewport: ViewportService
  ) {}

  /** The kind's full name, the same as in its node header and the right-click menu. */
  typeKey(type: CreatableNodeType): TranslationKey {
    return `board.node.types.${type}`
  }

  shortNameKey(type: CreatableNodeType): TranslationKey {
    return `board.create.types.${type}.name`
  }

  shortcutKeys(shortcut: (typeof SHORTCUTS)[number]): [TranslationKey, TranslationKey] {
    return [`dashboard.shortcuts.${shortcut}`, `dashboard.shortcuts.${shortcut}Keys`]
  }

  /** For the `?` key, wherever focus is on the board. */
  toggleShortcuts() {
    this.shortcutsPanel?.nativeElement.togglePopover()
  }
}
