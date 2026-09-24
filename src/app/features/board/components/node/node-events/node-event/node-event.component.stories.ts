import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { NodeEventComponent } from './node-event.component'
import { nodeStoryProviders } from '../../node-storybook.providers'

const meta: Meta<NodeEventComponent> = {
  title: 'Board/Molecules/Event chip',
  component: NodeEventComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
    componentWrapperDecorator(
      (story) => `<div style="min-height: 40rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    type: 'stat',
    target: 'courage',
    amount: '3',
  },
}

export default meta
type Story = StoryObj<NodeEventComponent>

export const PositiveStat: Story = {}
export const NegativeStat: Story = { args: { amount: '-2' } }
export const Condition: Story = {
  args: { type: 'condition', target: 'observatory_key', amount: '1' },
}
export const Property: Story = {
  args: {
    type: 'property',
    target: 'player_alias',
    amount: '0',
    property: 'The Stargazer',
  },
}
