import { computed, effect, Injectable, OnDestroy, signal, untracked } from '@angular/core'
import { Subject } from 'rxjs'
import { join, node, node_answer, tree } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { GameEngineService } from './game-engine.service'
import { GameSessionEvent, GameSessionProblem, GameVisit, PlayableNode, TextContinuation } from './game-session.types'
import { PlayerService } from './player.service'

/**
 * One playthrough, scoped to its host. Rules live in GameEngineService; display
 * modes and authoring controls do not belong here. Checkpoints capture what
 * happened, not what today's edited rules would have allowed to happen.
 */
@Injectable()
export class GameSessionService implements OnDestroy {
  private readonly recordedVisits = signal<GameVisit[]>([])
  private readonly position = signal(-1)
  private readonly sessionProblem = signal<GameSessionProblem>(null)
  private storyId?: string
  private nextVisitId = 0
  private step = 0
  private initialized = false
  private generation = 0
  private transition?: ReturnType<typeof setTimeout>
  private automaticCount = 0
  private readonly eventSubject = new Subject<GameSessionEvent>()

  readonly events = this.eventSubject.asObservable()
  readonly visits = this.recordedVisits.asReadonly()
  readonly cursor = this.position.asReadonly()
  readonly problem = this.sessionProblem.asReadonly()
  readonly currentVisit = computed(() => this.visits()[this.cursor()])
  readonly currentNodeId = computed(() => this.currentVisit()?.nodeId)
  readonly canGoBack = computed(() => this.previousExistingIndex() >= 0)
  readonly activeNodes = computed(() => {
    const current = this.currentVisit()
    return current ? this.visits().slice(0, this.cursor() + 1)
      .filter(visit => visit.step === current.step).map(visit => visit.rendered) : []
  })
  readonly inactiveNodes = computed(() => {
    const current = this.currentVisit()
    return current ? this.visits().slice(0, this.cursor() + 1)
      .filter(visit => visit.step < current.step).map(visit => visit.rendered) : []
  })

  constructor(
    private engine: GameEngineService,
    private player: PlayerService,
    private story: ActiveStoryService
  ) {
    effect(() => {
      const id = this.story.storyId()
      const tree = this.story.entireTree()
      untracked(() => this.synchronize(id, tree))
    }, { allowSignalWrites: true })
  }

  ngOnDestroy() {
    this.cancelTransition()
    this.eventSubject.complete()
  }

  initialize() {
    if (this.initialized) return
    this.initialized = true
    this.nextStep([{ node: 'node_0' }])
  }

  restart() {
    this.reset()
    if (this.story.entireTree().nodes.some(node => node.id === 'node_0')) this.initialize()
  }

  selectAnswer(answer: node_answer) {
    if (!answer.join?.length) return
    this.markCurrent({ selectedAnswerId: answer.id })
    this.engine.applyEvents(answer.events ?? [])
    this.eventSubject.next({ type: 'answer', answer })
    this.nextStep(answer.join)
  }

  continueFlow(info: TextContinuation) {
    if (!info.join?.length) return
    this.markCurrent({ userResponse: info.value })
    this.engine.alterProperty(info.property, info.value)
    this.nextStep(info.join)
  }

  /** Explicit navigation starts a new automatic-chain budget. */
  nextStep(joins: join[], addToCurrentStep = false) {
    this.cancelTransition()
    this.automaticCount = 0
    if (!joins.length) return
    this.recordedVisits.update(visits => visits.slice(0, this.cursor() + 1))
    this.step = addToCurrentStep ? (this.currentVisit()?.step ?? this.step) : this.step + 1
    this.sessionProblem.set(null)
    this.enter(joins)
  }

  back() {
    this.goToVisit(this.previousExistingIndex())
  }

  goToVisit(index: number) {
    const visit = this.visits()[index]
    if (!visit || index > this.cursor() || !this.existingNode(visit.nodeId)) return
    this.cancelTransition()
    this.sessionProblem.set(null)
    this.position.set(index)
    this.player.restore(visit.player)
    this.step = visit.step
    // Restoring a checkpoint never repeats arrival events or automatic joins.
  }

  pause() {
    this.cancelTransition()
  }

  private enter(joins: join[]) {
    if (!joins.length) return
    if (++this.automaticCount > 256) {
      this.sessionProblem.set('automaticLoop')
      return
    }

    let rendered: PlayableNode
    let entry: join
    try {
      entry = this.engine.getRandomJoin(joins)
      rendered = this.engine.buildNextNodeFromJoin(entry)
    } catch {
      this.sessionProblem.set('missingNode')
      return
    }

    this.engine.applyEvents(rendered.events ?? [])
    if (rendered.type === 'distributor') {
      this.scheduleFrom(rendered, true)
      return
    }

    this.engine.filterAvailableAnswers(rendered)
    rendered = this.engine.interpolateNodeTexts(rendered)
    const id = ++this.nextVisitId
    rendered.key = id
    const visit: GameVisit = {
      id, nodeId: rendered.id, step: this.step, entry: structuredClone(entry),
      player: this.player.snapshot(), rendered,
    }
    this.recordedVisits.update(visits => [...visits, visit])
    this.position.set(this.visits().length - 1)
    this.eventSubject.next({ type: 'node', node: rendered })
    if (rendered.type === 'end') this.eventSubject.next({ type: 'end' })
    if (rendered.join?.length && rendered.type !== 'text') this.scheduleFrom(rendered, false)
  }

  private scheduleFrom(origin: node, distributor: boolean) {
    const generation = this.generation
    const storyId = this.story.storyId()
    // Yield, not animate. Re-read joins so edits made before this task runs win.
    this.transition = setTimeout(() => {
      this.transition = undefined
      if (generation !== this.generation || storyId !== this.story.storyId()) return
      const latest = this.existingNode(origin.id)
      if (!latest) {
        this.sessionProblem.set('missingNode')
        return
      }
      const joins = distributor ? this.engine.distributeNode(latest) : latest.join ?? []
      this.enter(joins)
    })
  }

  private synchronize(id: string, tree: tree) {
    if (this.storyId !== id) {
      this.storyId = id
      this.reset()
    }
    const current = this.currentVisit()
    if (current && !this.existingNode(current.nodeId)) {
      const previous = this.previousExistingIndex()
      if (previous >= 0) this.goToVisit(previous)
      else this.restart()
    } else if (!this.initialized && tree.nodes.some(node => node.id === 'node_0')) {
      this.initialize()
    }
  }

  private existingNode(id: string) {
    return this.story.entireTree().nodes.find(node => node.id === id && node.type !== 'group')
  }

  private previousExistingIndex() {
    for (let index = this.cursor() - 1; index >= 0; index--) {
      if (this.existingNode(this.visits()[index].nodeId)) return index
    }
    return -1
  }

  private markCurrent(values: { selectedAnswerId?: string; userResponse?: string }) {
    this.recordedVisits.update(visits => visits.map((visit, index) => index === this.cursor()
      ? { ...visit, rendered: { ...visit.rendered, ...values } } : visit))
  }

  private reset() {
    this.cancelTransition()
    this.recordedVisits.set([])
    this.position.set(-1)
    this.sessionProblem.set(null)
    this.player.reset()
    this.initialized = false
    this.step = 0
  }

  private cancelTransition() {
    this.generation++
    if (this.transition !== undefined) clearTimeout(this.transition)
    this.transition = undefined
  }
}
