import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { ConditionComponent } from './condition.component'
import { nodeStoryProviders } from '../node/node-storybook.providers'

const meta: Meta<ConditionComponent> = {
  title: 'Board/Molecules/Condition',
  component: ConditionComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
    componentWrapperDecorator(
      (story) => `<div style="width: 32rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    conditionId: 'condition_18_0',
    selectedRef: 'stat_courage',
    comparator: 'morethan',
    value: 4,
    hasJoin: false,
  },
}

export default meta
type Story = StoryObj<ConditionComponent>

export const Default: Story = {}
export const Connected: Story = { args: { hasJoin: true } }
export const PropertyValue: Story = {
  args: {
    selectedRef: 'property_alias',
    comparator: 'equalto',
    value: 0,
  },
}
export const Fallback: Story = {
  args: {
    conditionId: 'condition_18_fallback',
    fallback: true,
  },
}
