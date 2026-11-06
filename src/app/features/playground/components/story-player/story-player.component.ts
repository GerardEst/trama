import { AfterViewInit, Component, computed, ElementRef, input, OnDestroy, OnInit, signal, ViewChild } from '@angular/core'
import { Game, GameState } from '@trama-app/engine'
import { node_answer } from 'src/app/core/interfaces/interfaces'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TextContinuation } from '../../services/game-session.types'
import { visitToPlayableNode } from '../../services/engine-adapter'
import { SingleGameComponent } from '../game/views/single-game.component'
import { CumulativeGameComponent } from '../game/views/cumulative-game.component'

/**
 * Reader-facing player for a @trama-app/engine game, in single or cumulative mode.
 * Starts the game on init, so subscribe to it before handing it over.
 */
@Component({
  selector: 'polo-story-player',
  standalone: true,
  imports: [SingleGameComponent, CumulativeGameComponent, TranslatePipe],
  templateUrl: './story-player.component.html',
  styleUrl: './story-player.component.css',
})
export class StoryPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('game') DOMgame!: ElementRef<HTMLElement>
  readonly game = input.required<Game>()
  readonly mode = input<'cumulative' | 'single'>('cumulative')

  private readonly state = signal<GameState | undefined>(undefined)
  readonly problem = computed(() => this.state()?.problem)
  readonly activeNodes = computed(() => this.state()?.activeVisits
    .map(visit => visitToPlayableNode(visit, this.game().story, this.i18n)) ?? [])
  readonly previousNodes = computed(() => this.state()?.previousVisits
    .map(visit => visitToPlayableNode(visit, this.game().story, this.i18n)) ?? [])

  private unsubscribe?: () => void
  private scrollTimer?: ReturnType<typeof setTimeout>
  private viewportObserver?: ResizeObserver
  private viewportHeight = 0
  private viewportScrollTop = 0
  private readonly rememberScroll = () => {
    const container = this.DOMgame.nativeElement
    // Ignore the browser's temporary clamp while a resize is being measured.
    if (container.clientHeight === this.viewportHeight) this.viewportScrollTop = container.scrollTop
  }

  constructor(private i18n: I18nService) {}

  ngOnInit() {
    const game = this.game()
    this.unsubscribe = game.subscribe(event => {
      if (event.type === 'state') this.state.set(event.state)
      else if (event.type === 'node') this.scrollToNewNode()
    })
    this.state.set(game.start())
  }

  ngAfterViewInit() {
    const container = this.DOMgame.nativeElement
    // Cumulative history can exceed the viewport. Size only the current step
    // against the real reading area, including responsive header/footer changes.
    const measure = () => {
      const height = container.clientHeight
      const resized = this.viewportHeight > 0 && height !== this.viewportHeight
      const atBottom = container.scrollHeight - this.viewportScrollTop - this.viewportHeight <= 2
      const scrollTop = this.viewportScrollTop
      this.viewportHeight = height
      container.style.setProperty('--polo-game-viewport-height', `${height}px`)
      // Growing the viewport can clamp scrolling before the new step height is
      // applied. Restore the reading position, or keep the answers at the end.
      if (resized) container.scrollTop = atBottom ? container.scrollHeight : scrollTop
      this.viewportScrollTop = container.scrollTop
    }
    container.addEventListener('scroll', this.rememberScroll)
    measure()
    this.viewportObserver = new ResizeObserver(measure)
    this.viewportObserver.observe(container)
  }

  ngOnDestroy() {
    this.unsubscribe?.()
    this.viewportObserver?.disconnect()
    this.DOMgame?.nativeElement.removeEventListener('scroll', this.rememberScroll)
    if (this.scrollTimer !== undefined) clearTimeout(this.scrollTimer)
  }

  choose(answer: node_answer) { this.game().choose(answer.id) }
  submitText(info: TextContinuation) { this.game().submitText(info.value) }

  private scrollToNewNode() {
    if (this.scrollTimer !== undefined) clearTimeout(this.scrollTimer)
    this.scrollTimer = setTimeout(() => {
      const container = this.DOMgame?.nativeElement
      const nodes = container?.querySelectorAll('polo-game-node')
      const latest = nodes?.item(nodes.length - 1) as HTMLElement | null
      if (!container || !latest) return
      container.scrollTo({ top: latest.offsetTop - container.offsetTop - 24, behavior: 'auto' })
    })
  }
}
