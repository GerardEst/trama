import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, argsToTemplate } from '@storybook/angular'
import { NodeComponent } from './node.component'
import { nodeStoryProviders } from './node-storybook.providers'

const meta: Meta<NodeComponent> = {
  title: 'Board/Organisms/Node',
  component: NodeComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; min-height: 48rem; padding: 3rem; background: var(--polo-color-canvas);">
        <polo-node ${argsToTemplate(args)}>
          <div class="dragHandle"><p><span style="text-transform: capitalize">{{ type }}</span> node</p></div>
        </polo-node>
      </div>
    `,
  }),
  args: {
    nodeId: 'node_12',
    type: 'content',
    text: 'The observatory door groans open. Beyond it, a spiral staircase disappears into blue light.',
    join: [],
    events: [],
  },
}

export default meta
type Story = StoryObj<NodeComponent>

export const Content: Story = {
  args: {
    answers: [
      { id: 'answer_12_0', text: 'Climb toward the light', join: [] },
      { id: 'answer_12_1', text: 'Search the entrance first', join: [] },
    ],
    events: [
      {
        id: 'event_1',
        action: 'alterStat',
        type: 'stat',
        target: 'courage',
        amount: '2',
      },
    ],
  },
}

export const TextInput: Story = {
  args: {
    nodeId: 'node_7',
    type: 'text',
    text: 'What name should the archivist use for you?',
    userTextOptions: {
      property: 'player_alias',
      placeholder: 'Your name',
      buttonText: 'Introduce myself',
      description: 'This name will appear throughout the story.',
    },
  },
}

export const Distributor: Story = {
  args: {
    nodeId: 'node_18',
    type: 'distributor',
    text: '',
    conditions: [
      {
        id: 'condition_18_0',
        ref: 'stat_courage',
        comparator: 'morethan',
        value: 4,
        join: [],
      },
      {
        id: 'condition_18_1',
        ref: 'condition_key',
        comparator: 'equalto',
        value: 1,
        join: [],
      },
    ],
    fallbackCondition: { id: 'condition_18_fallback', join: [] },
  },
}

export const Ending: Story = {
  args: {
    nodeId: 'node_24',
    type: 'end',
    text: 'At sunrise, the city finally remembers the stars.',
    links: [
      { name: 'Read the epilogue', url: 'https://example.com/epilogue' },
    ],
    shareOptions: {
      sharedText: 'I restored the observatory in The Last Astronomer.',
      shareButtonText: 'Share this ending',
    },
  },
}
