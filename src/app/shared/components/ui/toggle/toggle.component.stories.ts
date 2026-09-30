import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { expect, fn, userEvent, within } from '@storybook/test'
import { ToggleComponent } from './toggle.component'

const meta: Meta<ToggleComponent> = {
  title: 'Design System/Atoms/Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'An Apple-style, keyboard-accessible switch. Use a stable label for the setting, not an action. Supports [(checked)] or [checked] with (checkedChange). Set hideLabel for compact layouts; label is still required for accessibility.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    checkedChange: { control: false },
  },
  args: {
    label: 'Notifications',
    checked: false,
    disabled: false,
    hideLabel: false,
    checkedChange: fn(),
  },
}

export default meta
type Story = StoryObj<ToggleComponent>

export const Off: Story = {}
export const On: Story = { args: { checked: true } }
export const DisabledOff: Story = { args: { disabled: true } }
export const DisabledOn: Story = { args: { disabled: true, checked: true } }
export const WithoutVisibleLabel: Story = { args: { hideLabel: true } }
export const DarkMode: Story = { args: { label: 'Dark mode', checked: true } }

export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch', { name: 'Notifications' })
    await expect(toggle).not.toBeChecked()
    await userEvent.click(toggle)
    await expect(toggle).toBeChecked()
    await expect(args.checkedChange).toHaveBeenCalledWith(true)
    await userEvent.keyboard(' ')
    await expect(toggle).not.toBeChecked()
    await expect(args.checkedChange).toHaveBeenCalledWith(false)
  },
}
