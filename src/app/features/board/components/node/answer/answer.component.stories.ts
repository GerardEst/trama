import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular'
import { AnswerComponent } from './answer.component'
import { nodeStoryProviders } from '../node-storybook.providers'

const meta: Meta<AnswerComponent> = {
  title: 'Board/Organisms/Answer',
  component: AnswerComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: nodeStoryProviders }),
    componentWrapperDecorator(
      (story) => `<div style="width: 22rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    answerId: 'answer_12_0',
    text: 'Climb toward the light',
    hasJoin: false,
  },
}

export default meta
type Story = StoryObj<AnswerComponent>

export const Default: Story = {}
export const Connected: Story = { args: { hasJoin: true } }
export const LongAnswer: Story = {
  args: {
    text: 'Wait beside the old telescope until the clouds part and the northern constellations become visible.',
  },
}
