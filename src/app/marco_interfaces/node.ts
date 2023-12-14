import { answer } from './answer'

export interface node {
  id: string
  top: string
  left: string
  text?: string
  answers?: Array<answer>
}
