import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { NodeAddRequirementComponent } from './node-add-requirement.component'
import { nodeStoryProviders } from '../../node-storybook.providers'

const meta: Meta<NodeAddRequirementComponent> = {
  title: 'Board/Organisms/Requirement editor',
  component: NodeAddRequirementComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
    componentWrapperDecorator(
      (story) => `<div style="min-height: 46rem; padding: 3rem; background: var(--polo-color-canvas);"><div style="position: relative; width: 32rem;">${story}</div></div>`
    ),
  ],
  args: {
    type: 'stat',
    target: '',
    amount: undefined,
    canBeDeleted: false,
    onSaveRequirement: fn(),
    onDeleteRequirement: fn(),
    onClose: fn(),
  },
}

export default meta
type Story = StoryObj<NodeAddRequirementComponent>

export const NewRequirement: Story = {}
export const StatThreshold: Story = {
  args: {
    target: 'stat_courage',
    amount: 4,
  },
}
export const ActiveCondition: Story = {
  args: {
    type: 'condition',
    target: 'condition_key',
    amount: 1,
    canBeDeleted: true,
  },
}
export const InactiveCondition: Story = {
  args: {
    type: 'condition',
    target: 'condition_guard',
    amount: 0,
    canBeDeleted: true,
  },
}
