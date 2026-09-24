import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { ChoiceCardComponent } from './choice-card.component'

const meta: Meta<ChoiceCardComponent> = {
  title: 'Design System/Molecules/Choice card',
  component: ChoiceCardComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `
        <div style="width: 18rem; padding: 3rem; background: var(--polo-color-canvas);">
          ${story}
        </div>
      `
    ),
  ],
  argTypes: {
    icon: { control: 'text' },
    label: { control: 'text' },
    description: { control: 'text' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    chosen: { control: false },
  },
  args: {
    icon: '/assets/icons/stat.svg',
    label: 'Stat',
    description: 'Adjust a number',
    selected: false,
    disabled: false,
    chosen: fn(),
  },
}

export default meta
type Story = StoryObj<ChoiceCardComponent>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    selected: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    label: 'Custom option',
    description: 'A choice without a leading icon',
  },
}

export const LongDescription: Story = {
  args: {
    label: 'Condition',
    description:
      'Grant or remove a condition that changes what the player can access later.',
    icon: '/assets/icons/condition.svg',
  },
}
