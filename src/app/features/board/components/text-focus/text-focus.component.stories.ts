import type { Meta, StoryObj } from '@storybook/angular'
import { TextFocusComponent } from './text-focus.component'

const meta: Meta<TextFocusComponent> = {
  title: 'Board/Organisms/Text Focus',
  component: TextFocusComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    label: 'Node text',
    text: 'The observatory door groans open. Beyond it, a spiral staircase disappears into blue light.',
  },
}

export default meta
type Story = StoryObj<TextFocusComponent>

export const Passage: Story = {}

export const Prompt: Story = {
  args: {
    label: 'Prompt',
    text: 'What name should the archivist use for you?',
  },
}

export const Answer: Story = {
  args: {
    label: 'Answer text',
    text: 'Climb toward the light.',
  },
}
