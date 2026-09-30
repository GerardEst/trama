import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { GameNodeComponent } from './game-node.component'

const meta: Meta<GameNodeComponent> = {
  title: 'Playground/Passages/Story node',
  component: GameNodeComponent,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator(story =>
    `<div style="max-width: 54rem; min-height: 38rem; padding: 3rem; background: var(--polo-color-canvas)">${story}</div>`
  )],
  args: {
    data: {
      id: 'node_0', type: 'content', text: '<p>The path divides at the edge of the wood.</p><p>What will you do?</p>',
      answers: [
        { id: 'left', text: 'Follow the lanterns', join: [{ node: 'node_1' }] },
        { id: 'right', text: 'Take the unlit trail', join: [{ node: 'node_2' }] },
      ],
    },
    disabled: false,
    onSelectAnswer: fn(),
  },
}

export default meta
type Story = StoryObj<GameNodeComponent>

export const WithAnswers: Story = {}
export const WithHeading: Story = {
  args: {
    data: {
      id: 'node_heading', type: 'content',
      text: '<h2>The forest gate</h2><p>Two paths lead away from the clearing.</p>',
      answers: [{ id: 'continue', text: 'Enter the forest', join: [{ node: 'node_next' }] }],
    },
  },
}
export const InHistory: Story = {
  args: { disabled: true, data: { ...meta.args!.data, selectedAnswerId: 'left' } },
}
export const TextQuestion: Story = {
  args: {
    data: {
      id: 'node_3', type: 'text', text: '<p>What is your name?</p>',
      userTextOptions: { property: 'name', placeholder: 'Your name', description: 'Name', buttonText: 'Continue' },
      join: [{ node: 'node_4' }],
    },
  },
}
export const LongPassage: Story = {
  args: {
    data: {
      id: 'node_5', type: 'content',
      text: '<p>You have walked for hours. The rain has stopped, but the trail still winds through the trees.</p><p>A light appears in the distance. It could be a house or something else entirely.</p>',
      answers: [{ id: 'continue', text: 'Approach the light', join: [{ node: 'node_6' }] }],
    },
  },
}
export const Ending: Story = {
  args: {
    data: { id: 'node_7', type: 'end', text: '<p>You found your way home.</p>', links: [{ name: 'Visit Trama', url: 'https://trama.app' }] },
  },
}
