import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { BasicButtonComponent } from './basic-button.component'

const meta: Meta<BasicButtonComponent> = {
  title: 'Design System/Atoms/Button',
  component: BasicButtonComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    text: 'Continue',
    align: 'center',
  },
}

export default meta
type Story = StoryObj<BasicButtonComponent>

export const Default: Story = {}
export const Border: Story = { args: { border: true } }
export const Selected: Story = { args: { selected: true } }
export const Danger: Story = { args: { text: 'Delete', type: 'danger' } }
export const Success: Story = { args: { text: 'Saved', type: 'success' } }
export const IconOnly: Story = {
  args: {
    text: undefined,
    title: 'Duplicate',
    icon: '/assets/icons/duplicate.svg',
  },
}
export const Disabled: Story = { args: { disabled: true } }
export const Waiting: Story = { args: { waiting: true } }
