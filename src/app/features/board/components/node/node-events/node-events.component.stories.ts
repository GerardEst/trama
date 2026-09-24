import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { NodeEventsComponent } from './node-events.component'
import { nodeStoryProviders } from '../node-storybook.providers'

const meta: Meta<NodeEventsComponent> = {
  title: 'Board/Organisms/Event list',
  component: NodeEventsComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
    componentWrapperDecorator(
      (story) => `<div style="width: 34rem; min-height: 42rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    nodeId: 'node_12',
    events: [],
  },
}

export default meta
type Story = StoryObj<NodeEventsComponent>

export const Empty: Story = {}
export const WithEvents: Story = {
  args: {
    events: [
      {
        id: 'event_1',
        action: 'alterStat',
        type: 'stat',
        target: 'courage',
        amount: '3',
      },
      {
        id: 'event_2',
        action: 'alterCondition',
        type: 'condition',
        target: 'observatory_key',
        amount: '1',
      },
      {
        id: 'event_3',
        action: 'alterProperty',
        type: 'property',
        target: 'player_alias',
        amount: '0',
        property: 'The Stargazer',
      },
    ],
  },
}
