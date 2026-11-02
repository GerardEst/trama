// Story format: the JSON a Trama story is saved as. Editor-only fields are
// listed so saved stories type-check, but the engine ignores them.

export type RefType = 'stat' | 'condition' | 'property'
export type UnavailableAnswerDisplay = 'hidden' | 'locked' | 'requirements'
export type NodeType = 'text' | 'content' | 'distributor' | 'end' | 'group'

export interface StoryRef {
  id?: string
  name: string
  type: RefType
  category?: string
}

export interface StoryJoin {
  node: string
  /** Skip the passage and show only the answers of the target node. */
  toAnswer?: boolean
}

export interface StoryEvent {
  id?: string
  action: 'alterStat' | 'alterCondition' | 'alterProperty'
  type: RefType
  /** Stats: amount to add. Conditions: 1 adds, anything else removes. */
  amount: string | number
  target: string
  /** Value stored by alterProperty. */
  property?: string
}

export interface StoryRequirement {
  target: string
  type: 'stat' | 'condition'
  /** For stats, the minimum amount. For conditions, 1 = must have, 0 = must not have. */
  amount: number
}

export interface StoryAnswer {
  id: string
  text?: string
  join?: StoryJoin[]
  events?: StoryEvent[]
  requirements?: StoryRequirement[]
  /** Omitted means inherit the story setting. */
  unavailableAnswerDisplay?: UnavailableAnswerDisplay
}

export interface StoryConditionRule {
  ref?: string
  comparator?: string
  value?: number | string
}

export interface StoryConditionRoute {
  id?: string
  join?: StoryJoin[]
  /** Combined with AND. A route without rules never matches. */
  rules: StoryConditionRule[]
}

export interface StoryTextInput {
  property: string
  placeholder?: string
  buttonText?: string
  description?: string
}

export interface StoryLink {
  name: string
  url: string
}

export interface StoryShare {
  sharedText?: string
  shareButtonText?: string
}

export interface StoryNode {
  id: string
  type: NodeType
  name?: string
  text?: string
  image?: { path: string }
  join?: StoryJoin[]
  answers?: StoryAnswer[]
  conditions?: StoryConditionRoute[]
  fallbackCondition?: { id?: string; join?: StoryJoin[] }
  userTextOptions?: StoryTextInput
  events?: StoryEvent[]
  links?: StoryLink[]
  share?: StoryShare
  /** Editor only. */
  top?: string | number
  left?: string | number
  groupId?: string
}

export interface StoryTree {
  nodes?: StoryNode[]
  refs?: Record<string, StoryRef>
  categories?: Array<{ id: string; name: string }>
  /** Without a target, the story has no start. */
  entryPoint?: { targetNodeId?: string; left?: number; top?: number }
  unavailableAnswerDisplay?: UnavailableAnswerDisplay
  /** Editor only. */
  frames?: unknown[]
  frameColors?: unknown[]
}

/** A normalized, read-only story ready to be played. */
export interface Story {
  readonly nodes: readonly StoryNode[]
  readonly refs: Readonly<Record<string, StoryRef>>
  readonly entryNodeId?: string
  readonly unavailableAnswerDisplay: UnavailableAnswerDisplay
  node(id: string): StoryNode | undefined
}

// Runtime

export interface PlayerState {
  properties: Record<string, string>
  stats: Record<string, number>
  conditions: string[]
}

export interface MissingRequirement {
  ref: string
  /** Undefined when the reference was deleted from the story. */
  name?: string
  type: 'stat' | 'condition'
  /** For stats, the minimum amount. For conditions, 1 = must have, 0 = must not have. */
  required: number
  current: number
}

export interface SceneAnswer {
  id: string
  /** Inline HTML (or plain text in older stories) with variables resolved. */
  text: string
  /** False when the answer has no destination yet. */
  connected: boolean
  /** True when the player does not meet the requirements. */
  locked: boolean
  /** How the author wants a locked answer shown. Hidden answers are omitted. */
  display: Exclude<UnavailableAnswerDisplay, 'hidden'>
  /** Unmet requirements. Empty unless locked. */
  missing: MissingRequirement[]
}

export interface Scene {
  nodeId: string
  type: 'content' | 'text' | 'end'
  name?: string
  /** HTML (or plain text in older stories) with variables resolved. */
  text: string
  /** The author asked to jump straight to the answers. */
  skipText: boolean
  image?: { path: string; url: string }
  answers: SceneAnswer[]
  /** Present on text nodes: the player must type a value to continue. */
  input?: StoryTextInput
  links: StoryLink[]
  share?: StoryShare
}

export interface Visit {
  /** Unique within a game; stable across saves. */
  id: number
  nodeId: string
  /** Visits in the same step were reached without player input in between. */
  step: number
  entry: StoryJoin
  /** Player state on arrival, after the node's events. */
  player: PlayerState
  scene: Scene
  selectedAnswerId?: string
  userResponse?: string
}

export type GameProblem = 'missingStart' | 'missingNode' | 'automaticLoop'

export interface GameState {
  started: boolean
  /** Every recorded visit, including those after the cursor when the player went back. */
  visits: readonly Visit[]
  cursor: number
  current?: Visit
  /** Visits of the current step up to the cursor: what the player acts on now. */
  activeVisits: readonly Visit[]
  /** Visits of earlier steps up to the cursor. */
  previousVisits: readonly Visit[]
  player: PlayerState
  ended: boolean
  canGoBack: boolean
  problem: GameProblem | null
}

export interface StateChange {
  type: RefType
  ref: string
  before: string | number | boolean | undefined
  after: string | number | boolean | undefined
}

export type GameEvent =
  | { type: 'node'; visit: Visit }
  | { type: 'answer'; answer: SceneAnswer; visit: Visit }
  | { type: 'input'; property: string; value: string; visit: Visit }
  | { type: 'change'; change: StateChange }
  | { type: 'end'; visit: Visit }
  | { type: 'problem'; problem: GameProblem }
  /** Emitted once after every action that changed the game. */
  | { type: 'state'; state: GameState }

export interface GameOptions {
  /** Returns a number in [0, 1). Defaults to Math.random. */
  random?: () => number
  /** Resolves image paths. Defaults to Trama's public image storage. */
  imageUrl?: (path: string) => string
  /** Nodes entered without player input before giving up. Defaults to 256. */
  maxAutomaticSteps?: number
  /**
   * Follow automatic joins right away. Defaults to true. When false, the game
   * stops at every node and `advance()` follows its join.
   */
  autoAdvance?: boolean
}

export interface GameSave {
  version: 1
  started: boolean
  visits: Visit[]
  cursor: number
  step: number
  nextVisitId: number
  player: PlayerState
}

export interface Game {
  readonly story: Story
  /** Enters the starting node. Does nothing if the game already started. */
  start(): GameState
  /** Chooses an answer of the current step. Ignored if unavailable. */
  choose(answerId: string): GameState
  /** Submits the value asked by the current text node. */
  submitText(value: string): GameState
  /** Follows the automatic join of the current node, within the same step. */
  advance(): GameState
  /** Changes `autoAdvance` for the next moves. The current node stays where it is. */
  setAutoAdvance(enabled: boolean): void
  /** Returns to the previous visit, restoring the player state it had. */
  back(): GameState
  /** Returns to any visit up to the cursor. */
  goTo(visitIndex: number): GameState
  /**
   * Swaps in an edited version of the story without losing the playthrough.
   * Joins and answers are read from it from now on. If the current node was
   * removed, the game returns to the last visit whose node still exists, or
   * restarts. Emits a state event only when it had to move.
   */
  updateStory(story: Story | StoryTree): void
  restart(): GameState
  getState(): GameState
  save(): GameSave
  subscribe(listener: (event: GameEvent) => void): () => void
}
