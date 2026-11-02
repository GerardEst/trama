import { join, node, node_answer } from 'src/app/core/interfaces/interfaces'

/** Runtime-only fields the player views render. Never persisted in the authored tree. */
export interface PlayableAnswer extends node_answer {
  locked?: boolean
  missingRequirements?: string[]
}

export interface PlayableNode extends node {
  answers?: PlayableAnswer[]
  jumpToAnswers?: boolean
  key?: number
  selectedAnswerId?: string
  userResponse?: string
}

export interface TextContinuation {
  property: string
  value: string
  join?: join[]
}
