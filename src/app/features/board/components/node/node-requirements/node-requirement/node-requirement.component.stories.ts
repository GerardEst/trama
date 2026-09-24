import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { NodeRequirementComponent } from './node-requirement.component'
import { nodeStoryProviders } from '../../node-storybook.providers'

const meta: Meta<NodeRequirementComponent> = {
  title: 'Board/Molecules/Requirement chip',
  component: NodeRequirementComponent,
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
    amount: '4',
  },
}

export default meta
type Story = StoryObj<NodeRequirementComponent>

export const Stat: Story = {}
export const ActiveCondition: Story = {
  args: { type: 'condition', target: 'observatory_key', amount: '1' },
}
export const InactiveCondition: Story = {
  args: { type: 'condition', target: 'guard_alerted', amount: '0' },
}
