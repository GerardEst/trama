import { answer_requirement, event } from 'src/app/core/interfaces/interfaces'

/** Editor commands, separate from the persisted story model. */
export interface EventChange {
  target: string
  previousTarget?: string
  type: event['type']
  amount?: string | number
  property?: string
}

export interface RequirementChange {
  target: string
  previousValue?: string
  type: answer_requirement['type']
  amount: number | string
}
