import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { NodeOptionsComponent } from './node-options.component'

const meta: Meta<NodeOptionsComponent> = {
  title: 'Board/Molecules/Node options',
  component: NodeOptionsComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 14rem; padding: 3rem; background: var(--polo-color-canvas);"><div style="background: var(--polo-color-surface); border: 1px solid var(--polo-color-border); border-radius: .8rem; box-shadow: var(--polo-shadow-popover);">${story}</div></div>`
    ),
  ],
  args: {
    type: 'content',
    nodeId: 'node_12',
    onDuplicateNode: fn(),
    onRemoveNode: fn(),
    onAddImage: fn(),
    onClose: fn(),
  },
}

export default meta
type Story = StoryObj<NodeOptionsComponent>

export const Default: Story = {}
export const FirstNode: Story = { args: { nodeId: 'node_0' } }
export const Distributor: Story = { args: { type: 'distributor' } }
