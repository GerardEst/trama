import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { GameEndActionsComponent } from './game-end-actions.component'

const meta: Meta<GameEndActionsComponent> = {
  title: 'Playground/Endings/Actions',
  component: GameEndActionsComponent,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator(story =>
    `<div style="max-width: 48rem; padding: 3rem; background: var(--polo-color-canvas)">${story}</div>`
  )],
  args: {
    text: 'You made it home.',
    links: [{ name: 'Explore more stories', url: 'https://trama.app' }],
    sharing: true,
  },
}

export default meta
type Story = StoryObj<GameEndActionsComponent>

export const Default: Story = {}
export const NoSharing: Story = { args: { sharing: false } }
export const ShareOnly: Story = { args: { links: [], share: { shareButtonText: 'Share this ending' } } }
