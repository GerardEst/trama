import { loadStory } from './story'
import { applyEvents, distribute, emptyPlayer, meetsRequirements, setProperty } from './rules'
import { renderScene } from './scene'
import {
  Game,
  GameEvent,
  GameOptions,
  GameProblem,
  GameSave,
  GameState,
  PlayerState,
  StateChange,
  Story,
  StoryEvent,
  StoryJoin,
  StoryTree,
  Visit,
} from './types'

/**
 * Starts a playthrough. Nothing happens until `start()` is called, so listeners
 * can subscribe first and receive the opening events.
 */
export function createGame(story: Story | StoryTree, options: GameOptions = {}): Game {
  return new Playthrough(toStory(story), options)
}

/** Continues a playthrough saved with `game.save()`. */
export function restoreGame(story: Story | StoryTree, save: GameSave, options: GameOptions = {}): Game {
  if (save?.version !== 1) throw new TypeError('Unsupported game save')
  const game = new Playthrough(toStory(story), options)
  game.load(save)
  return game
}

function toStory(value: Story | StoryTree): Story {
  return typeof (value as Story).node === 'function' ? value as Story : loadStory(value as StoryTree)
}

class Playthrough implements Game {
  private currentStory: Story
  private started = false
  private visits: Visit[] = []
  private cursor = -1
  private step = 0
  private nextVisitId = 0
  private player: PlayerState = emptyPlayer()
  private problem: GameProblem | null = null
  private autoAdvance: boolean
  private listeners = new Set<(event: GameEvent) => void>()
  private readonly random: () => number
  private readonly imageUrl?: (path: string) => string
  private readonly maxAutomaticSteps: number

  constructor(story: Story, options: GameOptions) {
    this.currentStory = story
    this.random = options.random ?? Math.random
    this.imageUrl = options.imageUrl
    this.maxAutomaticSteps = options.maxAutomaticSteps ?? 256
    this.autoAdvance = options.autoAdvance ?? true
  }

  get story() {
    return this.currentStory
  }

  start() {
    if (this.started) return this.getState()
    return this.act(() => {
      const entry = this.story.entryNodeId
      if (!entry) return this.fail('missingStart')
      this.started = true
      this.nextStep([{ node: entry }])
    })
  }

  choose(answerId: string) {
    // Answers come from the current story, so edits made since arrival count.
    const visit = [...this.activeVisits()].reverse()
      .find(candidate => this.story.node(candidate.nodeId)?.answers?.some(answer => answer.id === answerId))
    const answer = visit && this.story.node(visit.nodeId)?.answers?.find(candidate => candidate.id === answerId)
    if (!visit || !answer?.join?.length || !meetsRequirements(this.player, answer.requirements)) {
      return this.getState()
    }
    const scene = renderScene(this.story, visit.nodeId, visit.entry, this.player, this.renderOptions())
    return this.act(() => {
      const marked = this.mark(visit, { selectedAnswerId: answerId })
      this.applyEvents(answer.events)
      const sceneAnswer = scene?.answers.find(candidate => candidate.id === answerId)
      if (sceneAnswer) this.emit({ type: 'answer', answer: sceneAnswer, visit: marked })
      this.nextStep(answer.join ?? [])
    })
  }

  submitText(value: string) {
    const visit = this.visits[this.cursor]
    const node = visit && this.story.node(visit.nodeId)
    if (!visit || node?.type !== 'text' || !node.join?.length) return this.getState()
    return this.act(() => {
      const marked = this.mark(visit, { userResponse: value })
      const property = node.userTextOptions?.property ?? ''
      if (property) this.emitChange(setProperty(this.player, property, value))
      this.emit({ type: 'input', property, value, visit: marked })
      this.nextStep(node.join ?? [])
    })
  }

  advance() {
    const visit = this.visits[this.cursor]
    const node = visit && this.story.node(visit.nodeId)
    if (!node || node.type === 'text' || !node.join?.length) return this.getState()
    return this.act(() => this.nextStep(node.join ?? [], true))
  }

  setAutoAdvance(enabled: boolean) {
    this.autoAdvance = enabled
  }

  back() {
    return this.goTo(this.previousExistingIndex())
  }

  goTo(visitIndex: number) {
    const visit = this.visits[visitIndex]
    if (!visit || visitIndex > this.cursor || !this.story.node(visit.nodeId)) return this.getState()
    // Restoring a visit never repeats its events or automatic joins.
    return this.act(() => this.restoreVisit(visitIndex))
  }

  restart() {
    this.reset()
    return this.start()
  }

  updateStory(story: Story | StoryTree) {
    this.currentStory = toStory(story)
    const current = this.visits[this.cursor]
    // Joins are read when they are followed, so only a removed current node needs handling.
    if (!current || this.story.node(current.nodeId)) return
    const previous = this.previousExistingIndex()
    if (previous >= 0) this.act(() => this.restoreVisit(previous))
    else this.restart()
  }

  getState(): GameState {
    const current = this.visits[this.cursor]
    const reached = this.visits.slice(0, this.cursor + 1)
    return structuredClone({
      started: this.started,
      visits: this.visits,
      cursor: this.cursor,
      current,
      activeVisits: current ? reached.filter(visit => visit.step === current.step) : [],
      previousVisits: current ? reached.filter(visit => visit.step < current.step) : [],
      player: this.player,
      ended: current?.scene.type === 'end',
      canGoBack: this.previousExistingIndex() >= 0,
      problem: this.problem,
    })
  }

  save(): GameSave {
    return structuredClone({
      version: 1 as const,
      started: this.started,
      visits: this.visits,
      cursor: this.cursor,
      step: this.step,
      nextVisitId: this.nextVisitId,
      player: this.player,
    })
  }

  load(save: GameSave) {
    const copy = structuredClone(save)
    this.started = copy.started
    this.visits = copy.visits
    this.cursor = copy.cursor
    this.step = copy.step
    this.nextVisitId = copy.nextVisitId
    this.player = copy.player
  }

  subscribe(listener: (event: GameEvent) => void) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  // Internals

  private act(action: () => void) {
    action()
    const state = this.getState()
    this.emit({ type: 'state', state })
    return state
  }

  /** Player input starts a new step, unless it continues the current one, and a new automatic budget. */
  private nextStep(joins: readonly StoryJoin[], sameStep = false) {
    if (!joins.length) return
    this.visits = this.visits.slice(0, this.cursor + 1)
    this.step = sameStep ? this.visits[this.cursor]?.step ?? this.step : this.step + 1
    this.problem = null
    this.enter(joins)
  }

  /** Enters nodes until one needs the player: distributors and automatic joins chain. */
  private enter(joins: readonly StoryJoin[]) {
    for (let count = 1; joins.length; count++) {
      if (count > this.maxAutomaticSteps) return this.fail('automaticLoop')
      const entry = joins[Math.floor(this.random() * joins.length)] ?? joins[0]
      const node = this.story.node(entry.node)
      if (!node) return this.fail('missingNode')

      this.applyEvents(node.events)
      if (node.type === 'distributor') {
        joins = distribute(node, this.player)
        continue
      }

      const visit: Visit = {
        id: ++this.nextVisitId,
        nodeId: node.id,
        step: this.step,
        entry: { ...entry },
        player: structuredClone(this.player),
        scene: renderScene(this.story, node.id, entry, this.player, this.renderOptions())!,
      }
      this.visits.push(visit)
      this.cursor = this.visits.length - 1
      this.emit({ type: 'node', visit: structuredClone(visit) })
      if (node.type === 'end') this.emit({ type: 'end', visit: structuredClone(visit) })
      joins = node.type === 'text' || !this.autoAdvance ? [] : node.join ?? []
    }
  }

  private restoreVisit(index: number) {
    const visit = this.visits[index]
    this.problem = null
    this.cursor = index
    this.player = structuredClone(visit.player)
    this.step = visit.step
  }

  /** Visits whose node was removed from the story cannot be returned to. */
  private previousExistingIndex() {
    for (let index = this.cursor - 1; index >= 0; index--) {
      if (this.story.node(this.visits[index].nodeId)) return index
    }
    return -1
  }

  private renderOptions() {
    return this.imageUrl ? { imageUrl: this.imageUrl } : {}
  }

  private applyEvents(events?: readonly StoryEvent[]) {
    const result = applyEvents(this.player, events)
    this.player = result.player
    result.changes.forEach(change => this.emitChange(change))
  }

  private mark(visit: Visit, values: Pick<Visit, 'selectedAnswerId' | 'userResponse'>) {
    const marked = { ...visit, ...values }
    this.visits = this.visits.map(candidate => candidate.id === visit.id ? marked : candidate)
    return structuredClone(marked)
  }

  private activeVisits() {
    const current = this.visits[this.cursor]
    return current ? this.visits.slice(0, this.cursor + 1).filter(visit => visit.step === current.step) : []
  }

  private fail(problem: GameProblem) {
    this.problem = problem
    this.emit({ type: 'problem', problem })
  }

  private emitChange(change: StateChange) {
    this.emit({ type: 'change', change })
  }

  private emit(event: GameEvent) {
    for (const listener of [...this.listeners]) listener(event)
  }

  private reset() {
    this.started = false
    this.visits = []
    this.cursor = -1
    this.step = 0
    this.player = emptyPlayer()
    this.problem = null
  }
}
