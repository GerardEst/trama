import { UnavailableAnswerDisplay } from 'src/app/core/interfaces/interfaces'

export function answerDisplay(value: unknown): UnavailableAnswerDisplay {
  return value === 'locked' || value === 'requirements' ? value : 'hidden'
}
