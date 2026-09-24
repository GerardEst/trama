import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { NodeAddModifyRefComponent } from './node-add-modify-ref.component'
import { nodeStoryProviders } from '../../node-storybook.providers'

const meta: Meta<NodeAddModifyRefComponent> = {
  title: 'Board/Molecules/Reference fields',
  component: NodeAddModifyRefComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
    componentWrapperDecorator(
      (story) => `<div style="width: 30rem; min-height: 32rem; padding: 3rem; background: var(--polo-color-surface);">${story}</div>`
    ),
  ],
  args: {
    type: 'stat',
    mode: 'event',
    selectedOption: 'stat_courage',
    amount: 3,
    onChangeTarget: fn(),
    onChangeAmount: fn(),
    onChangeProperty: fn(),
  },
}

export default meta
type Story = StoryObj<NodeAddModifyRefComponent>

export const StatEvent: Story = {}
export const ConditionEvent: Story = {
  args: {
    type: 'condition',
    selectedOption: 'condition_key',
    amount: 1,
  },
}
export const PropertyEvent: Story = {
  args: {
    type: 'property',
    selectedOption: 'property_alias',
    property: 'The Stargazer',
  },
}
export const StatRequirement: Story = {
  args: {
    mode: 'requirement',
    type: 'stat',
    selectedOption: 'stat_reputation',
    amount: 5,
  },
}
