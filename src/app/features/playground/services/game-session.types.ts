import { join, node, node_answer } from 'src/app/core/interfaces/interfaces'
import { PlayerSnapshot } from './player.service'

/** Runtime-only fields. Never persisted in the authored tree. */
export interface PlayableNode extends node {
  jumpToAnswers?: boolean
  key?: number
  selectedAnswerId?: string
  userResponse?: string
}

export interface GameVisit {
  id: number
  nodeId: string
  step: number
  entry: join
  player: PlayerSnapshot
  rendered: PlayableNode
}

export interface TextContinuation {
  property: string
  value: string
  join?: join[]
}

export type GameSessionEvent =
  | { type: 'node'; node: PlayableNode }
  | { type: 'answer'; answer: node_answer }
  | { type: 'end' }

export type GameSessionProblem = 'missingStart' | 'missingNode' | 'automaticLoop' | null
