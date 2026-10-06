import { AfterViewInit, Component, Output, EventEmitter, Input, ViewChild, ElementRef, OnDestroy, DestroyRef } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { join, node, node_answer } from 'src/app/core/interfaces/interfaces'
import { GameEngineService } from '../../services/game-engine.service'
import { GameSessionService } from '../../services/game-session.service'
import { TextContinuation } from '../../services/game-session.types'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { SingleGameComponent } from './views/single-game.component'
import { CumulativeGameComponent } from './views/cumulative-game.component'

/** Public player shell. The linear editor imports neither this nor cumulative mode. */
@Component({
  selector: 'polo-game',
  standalone: true,
  imports: [SingleGameComponent, CumulativeGameComponent],
  providers: [GameSessionService],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('game') DOMgame!: ElementRef<HTMLElement>
  @Input() mode: 'cumulative' | 'single' = 'cumulative'
  @Output() onEndGame = new EventEmitter<void>()
  @Output() onSelectAnswer = new EventEmitter<node_answer>()
  @Output() onDrawNode = new EventEmitter<node>()
  private scrollTimer?: ReturnType<typeof setTimeout>
  private viewportObserver?: ResizeObserver
  private viewportHeight = 0
  private viewportScrollTop = 0
  private readonly rememberScroll = () => {
    const container = this.DOMgame.nativeElement
    // Ignore the browser's temporary clamp while a resize is being measured.
    if (container.clientHeight === this.viewportHeight) this.viewportScrollTop = container.scrollTop
  }

  get activeNodes() { return this.session.activeNodes() }
  get inactiveNodes() { return this.session.inactiveNodes() }

  constructor(
    public gameEngine: GameEngineService,
    public activeStory: ActiveStoryService,
    public session: GameSessionService,
    destroyRef: DestroyRef
  ) {
    this.session.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(event => {
      if (event.type === 'node') {
        this.scrollToNewNode()
        this.onDrawNode.emit(event.node)
      } else if (event.type === 'answer') this.onSelectAnswer.emit(event.answer)
      else this.onEndGame.emit()
    })
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
    this.viewportObserver?.disconnect()
    this.DOMgame?.nativeElement.removeEventListener('scroll', this.rememberScroll)
    if (this.scrollTimer !== undefined) clearTimeout(this.scrollTimer)
  }

  initializeGame() { this.session.initialize() }
  selectAnswer(answer: node_answer) { this.session.selectAnswer(answer) }
  continueFlow(info: TextContinuation) { this.session.continueFlow(info) }
  nextStep(joins: join[], addToCurrentStep = false) { this.session.nextStep(joins, addToCurrentStep) }

  scrollToNewNode() {
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
