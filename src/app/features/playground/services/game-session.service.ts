import { computed, effect, Injectable, OnDestroy, signal, untracked } from '@angular/core'
import { createGame, Game, GameState, loadStory, PlayerState } from '@trama/engine'
import { tree } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

const EMPTY_PLAYER: PlayerState = { properties: {}, stats: {}, conditions: [] }

/**
 * Live preview of the active story for the editors, on top of @trama/engine.
 * Follows edits without losing the playthrough: joins and answers come from the
 * latest tree, and removing the current node rewinds to the last visit that
 * still exists. Checkpoints capture what happened, not what today's edited
 * rules would have allowed. Switching stories starts over.
 */
@Injectable()
export class GameSessionService implements OnDestroy {
  private game?: Game
  private unsubscribe?: () => void
  private storyId?: string
  private autoAdvance = true
  private readonly state = signal<GameState | undefined>(undefined)

  /** The active tree as the engine reads it. Editor trees are frozen, so this does not copy them. */
  readonly story = computed(() => loadStory(this.activeStory.entireTree()))
  readonly visits = computed(() => this.state()?.visits ?? [])
  readonly cursor = computed(() => this.state()?.cursor ?? -1)
  readonly problem = computed(() => this.state()?.problem ?? null)
  readonly player = computed(() => this.state()?.player ?? EMPTY_PLAYER)
  readonly currentVisit = computed(() => this.visits()[this.cursor()])
  readonly currentNodeId = computed(() => this.currentVisit()?.nodeId)
  readonly canGoBack = computed(() => {
    const story = this.story()
    return this.visits().slice(0, Math.max(this.cursor(), 0)).some(visit => !!story.node(visit.nodeId))
  })

  constructor(private activeStory: ActiveStoryService) {
    effect(() => {
      const id = this.activeStory.storyId()
      const storyTree = this.activeStory.entireTree()
      this.story()
      untracked(() => this.synchronize(id, storyTree))
    }, { allowSignalWrites: true })
  }

  ngOnDestroy() {
    this.unsubscribe?.()
  }

  restart() { this.play(game => game.restart()) }
  selectAnswer(answerId: string) { this.play(game => game.choose(answerId)) }
  continueFlow(value: string) { this.play(game => game.submitText(value)) }
  /** Follows the current node's automatic join, within the same step. */
  advance() { this.play(game => game.advance()) }
  back() { this.play(game => game.back()) }
  goToVisit(index: number) { this.play(game => game.goTo(index)) }

  /** While editing, the preview stops at every node instead of following automatic joins. */
  setAutoAdvance(enabled: boolean) {
    this.autoAdvance = enabled
    this.game?.setAutoAdvance(enabled)
  }

  /** Acts on the latest tree, even if an edit has not reached the effect yet. */
  private play(action: (game: Game) => void) {
    this.synchronize(this.activeStory.storyId(), this.activeStory.entireTree())
    if (this.game) action(this.game)
  }

  private synchronize(id: string, storyTree: tree) {
    const story = this.story()
    if (!this.game || this.storyId !== id) {
      this.storyId = id
      this.unsubscribe?.()
      const game = createGame(story, { autoAdvance: this.autoAdvance })
      this.unsubscribe = game.subscribe(event => { if (event.type === 'state') this.state.set(event.state) })
      this.game = game
      this.state.set(game.getState())
    } else {
      this.game.updateStory(story)
    }
    if (!this.state()?.started && storyTree.entryPoint) this.game.start()
  }
}
