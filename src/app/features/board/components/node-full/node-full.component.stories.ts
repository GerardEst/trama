import type { Meta, StoryObj } from '@storybook/angular'
import { NodeFullComponent } from './node-full.component'

const meta: Meta<NodeFullComponent> = {
  title: 'Board/Organisms/Node Full',
  component: NodeFullComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    nodeId: 'node_12',
    type: 'content',
    text: 'The observatory door groans open. Beyond it, a spiral staircase disappears into blue light.',
  },
}

export default meta
type Story = StoryObj<NodeFullComponent>

export const Content: Story = {}

export const TextInput: Story = {
  args: {
    nodeId: 'node_7',
    type: 'text',
    text: 'What name should the archivist use for you?',
  },
}

export const Ending: Story = {
  args: {
    nodeId: 'node_24',
    type: 'end',
    text: 'At sunrise, the city finally remembers the stars.',
  },
}
