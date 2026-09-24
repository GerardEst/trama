import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { expect, fn, userEvent, within } from '@storybook/test'
import { SelectOrCreateComponent } from './select-or-create.component'

const options = [
  { id: 'stat_courage', name: 'Courage' },
  { id: 'stat_reputation', name: 'Reputation' },
  { id: 'stat_insight', name: 'Insight' },
]

const meta: Meta<SelectOrCreateComponent> = {
  title: 'Design System/Molecules/Select or create',
  component: SelectOrCreateComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 28rem; min-height: 32rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    options,
    message: 'Choose or create a stat',
    selectedOption: 'stat_courage',
    onNewOption: fn(),
    onSelectOption: fn(),
    onClose: fn(),
  },
}

export default meta
type Story = StoryObj<SelectOrCreateComponent>

export const Default: Story = {}
export const NoOptions: Story = {
  args: {
    options: [],
    selectedOption: undefined,
  },
}
export const CreateNew: Story = {
  args: {
    selectedOption: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByPlaceholderText('Type a name…'), 'Wisdom')
    await expect(
      canvas.getByRole('button', { name: /Create.*Wisdom/ })
    ).toBeInTheDocument()
  },
}
