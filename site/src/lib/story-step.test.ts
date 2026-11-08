import { describe, expect, it } from 'vitest'
import { createGame, type GameState } from '@trama-app/engine'
import { buildExampleStory, EXAMPLE_STORY_COPY } from '@app/app/shared/example-story/exampleStory'
import { describeMissing, renderStep, type StepStrings } from './story-step'

const strings: StepStrings = {
  unavailable: 'Unavailable',
  stat: 'Requires {name}: at least {amount} (you have {current})',
  condition: 'Requires: {name}',
  absentCondition: 'Requires not having: {name}',
  unknown: 'A requirement is not met',
  yourAnswer: 'Your answer',
  continue: 'Continue',
}

function dom(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

describe('renderStep', () => {
  it('renders the opening scene with its authored HTML and every path', () => {
    const game = createGame(buildExampleStory(EXAMPLE_STORY_COPY.en))
    const step = dom(renderStep(game.start(), strings))
    expect(step.querySelector('.node__passage strong')?.textContent).toBe('Hollow Citadel')
    const answers = [...step.querySelectorAll<HTMLButtonElement>('button.answer')]
    expect(answers.map(answer => answer.dataset['answer'])).toEqual(['answer_0_0', 'answer_0_1', 'answer_0_2'])
    expect(answers.every(answer => !answer.disabled)).toBe(true)
  })

  it('follows choices and resolves variables', () => {
    const game = createGame(buildExampleStory(EXAMPLE_STORY_COPY.en))
    game.start()
    game.choose('answer_0_0')
    const state = game.choose('answer_1_0')
    const step = dom(renderStep(state, strings))
    expect(step.textContent).toContain('the Last Blade')
    expect(step.querySelector('[data-trama-variable]')).toBeNull()
  })

  it('shows locked answers with their missing requirements, escaped', () => {
    const state = {
      activeVisits: [{
        id: 1, nodeId: 'node_0', step: 1, entry: { node: 'node_0' },
        player: { properties: {}, stats: {}, conditions: [] },
        scene: {
          nodeId: 'node_0', type: 'content', text: '<p>A door</p>', skipText: false, links: [],
          answers: [{
            id: 'answer_0_0', text: 'Open it', connected: true, locked: true, display: 'requirements',
            missing: [{ ref: 'stat_1', name: '<gold>', type: 'stat', required: 3, current: 1 }],
          }],
        },
      }],
    } as unknown as GameState
    const button = dom(renderStep(state, strings)).querySelector('button')!
    expect(button.disabled).toBe(true)
    expect(button.querySelector('.answer__requirement')?.textContent).toBe('Requires <gold>: at least 3 (you have 1)')
  })
})

describe('describeMissing', () => {
  it('never shows internal ids for deleted references', () => {
    expect(describeMissing({ ref: 'condition_9', type: 'condition', required: 1, current: 0 }, strings))
      .toBe('A requirement is not met')
    expect(describeMissing({ ref: 'condition_1', name: 'key', type: 'condition', required: 0, current: 1 }, strings))
      .toBe('Requires not having: key')
  })
})
