import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { expect, fn, userEvent, within } from '@storybook/test'
import { SelectorComponent } from './selector.component'

const options = [
  { id: 'stat_courage', name: 'Courage' },
  { id: 'stat_reputation', name: 'Reputation' },
  { id: 'stat_insight', name: 'Insight' },
]

const meta: Meta<SelectorComponent> = {
  title: 'Design System/Organisms/Selector',
  component: SelectorComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 26rem; min-height: 34rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    options,
    selected: 'stat_courage',
    message: 'Choose or create a stat',
    placeholder: 'Choose or create a stat',
    controlId: 'storybook-selector',
    optionCreated: fn(),
    selectionChanged: fn(),
  },
}

export default meta
type Story = StoryObj<SelectorComponent>

export const Selected: Story = {}
export const Placeholder: Story = { args: { selected: undefined } }
export const Disabled: Story = { args: { disabled: true } }
export const Open: Story = {
  args: { selected: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Choose or create a stat/ }))
    await expect(
      canvas.getByRole('dialog', { name: 'Choose or create an option' })
    ).toBeInTheDocument()
  },
}
