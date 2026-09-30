import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { GameAnswerComponent } from './game-answer.component'

const meta: Meta<GameAnswerComponent> = {
  title: 'Playground/Choices/Answer',
  component: GameAnswerComponent,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator(story =>
    `<div style="max-width: 48rem; padding: 3rem; background: var(--polo-color-canvas)">${story}</div>`
  )],
  args: { text: 'Open the door', disabled: false, selected: false, chosen: fn() },
}

export default meta
type Story = StoryObj<GameAnswerComponent>

export const Default: Story = {}
export const Selected: Story = { args: { selected: true } }
export const InHistory: Story = { args: { disabled: true, selected: true } }
export const LongAnswer: Story = {
  args: { text: 'Follow the narrow path through the forest, even though you cannot see where it ends.' },
}
