import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { NodeRequirementsComponent } from './node-requirements.component'
import { nodeStoryProviders } from '../node-storybook.providers'

const meta: Meta<NodeRequirementsComponent> = {
  title: 'Board/Organisms/Requirement list',
  component: NodeRequirementsComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
    componentWrapperDecorator(
      (story) => `<div style="width: 34rem; min-height: 42rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    answerId: 'answer_12_0',
    requirements: [],
  },
}

export default meta
type Story = StoryObj<NodeRequirementsComponent>

export const Empty: Story = {}
export const WithRequirements: Story = {
  args: {
    requirements: [
      { target: 'stat_courage', type: 'stat', amount: 4 },
      { target: 'condition_key', type: 'condition', amount: 1 },
    ],
  },
}
