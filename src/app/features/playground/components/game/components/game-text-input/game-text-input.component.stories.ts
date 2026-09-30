import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { GameTextInputComponent } from './game-text-input.component'

const meta: Meta<GameTextInputComponent> = {
  title: 'Playground/Choices/Text input',
  component: GameTextInputComponent,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator(story =>
    `<div style="max-width: 48rem; padding: 3rem; background: var(--polo-color-canvas)">${story}</div>`
  )],
  args: {
    options: { property: 'name', placeholder: 'Your name', description: 'What should we call you?', buttonText: 'Set name' },
    submitted: fn(),
  },
}

export default meta
type Story = StoryObj<GameTextInputComponent>

export const Default: Story = {}
export const WithoutDescription: Story = {
  args: { options: { property: 'name', placeholder: 'Your name' } },
}
