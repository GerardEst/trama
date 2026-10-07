import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { expect, fn, userEvent, within } from '@storybook/test'
import { FRAME_COLORS, frameColorToken } from 'src/app/features/board/frame-colors'
import { ColorEdit, ColorOption } from '../../../utils/color'
import { ColorPickerComponent } from './color-picker.component'

const options: ColorOption[] = [
  { value: 'default', name: 'Default', swatch: frameColorToken(), editable: false },
  ...FRAME_COLORS.map((color) => ({
    value: color,
    name: color[0].toUpperCase() + color.slice(1),
    swatch: frameColorToken(color),
  })),
  { value: 'color_battle', name: 'Battle', swatch: '#aabbcc' },
]

const meta: Meta<ColorPickerComponent> = {
  title: 'Design System/Molecules/Color picker',
  component: ColorPickerComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="min-height: 34rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A compact color swatch that opens a named story palette. Values are stable color IDs. The parent persists colorSave events in the story and shares edits across frames. Default is selectable but not editable. Use the theme toolbar to preview light and dark modes.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    value: { control: 'select', options: ['default', ...FRAME_COLORS, 'color_battle'] },
    options: { control: 'object' },
    valueChange: { control: false },
    colorSave: { control: false },
  },
  args: {
    label: 'Frame color',
    hint: 'Saved with this story. Editing updates every frame using this color.',
    value: 'default',
    options,
    valueChange: fn(),
    colorSave: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      saveColor(this: { options: ColorOption[]; value: string; colorSave: (edit: ColorEdit) => void }, edit: ColorEdit) {
        const id = edit.source ?? `color_${crypto.randomUUID()}`
        const color = { value: id, name: edit.name, swatch: edit.value }
        this.options = this.options.some(option => option.value === id)
          ? this.options.map(option => option.value === id ? color : option)
          : [...this.options, color]
        this.value = id
        this.colorSave(edit)
      },
    },
    template: `
      <polo-color-picker
        [label]="label"
        [hint]="hint"
        [options]="options"
        [value]="value"
        (valueChange)="value = $event; valueChange($event)"
        (colorSave)="saveColor($event)"
      ></polo-color-picker>
    `,
  }),
}

export default meta
type Story = StoryObj<ColorPickerComponent>

export const Default: Story = {}
export const PastelSelected: Story = { args: { value: 'mint' } }
export const CustomColor: Story = { args: { value: 'color_battle' } }

export const OpenPalette: Story = {
  args: { value: 'rose' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^Frame color:/ }))
    await expect(canvas.getByRole('dialog', { name: 'Choose a color' })).toBeInTheDocument()
  },
}

export const CreateColor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^Frame color:/ }))
    await userEvent.click(canvas.getByRole('button', { name: 'Create a color' }))
    await expect(canvas.getByRole('textbox', { name: 'Color name' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Save and apply' })).toBeDisabled()
  },
}

export const EditColor: Story = {
  args: { value: 'mint' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^Frame color:/ }))
    const edit = canvasElement.querySelector<HTMLButtonElement>('.colorPicker__edit[data-key="mint"]')!
    await userEvent.click(edit)
    await expect(canvas.getByRole('textbox', { name: 'Color name' })).not.toHaveValue('')
    await expect(canvas.getByRole('button', { name: 'Save and apply' })).toBeEnabled()
  },
}

export const InteractiveSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^Frame color:/ }))
    // Both presets and named story colors use stable IDs.
    const edit = canvasElement.querySelector<HTMLButtonElement>('.colorPicker__edit[data-key="mint"]')!
    const choice = edit.closest('li')!.querySelector<HTMLButtonElement>('.colorPicker__option')!
    const value = choice.dataset['color']!
    const name = choice.querySelector('.colorPicker__name')!.textContent!.trim()
    await userEvent.click(choice)
    await expect(args.valueChange).toHaveBeenCalledWith(value)
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: `Frame color: ${name}` })).toBeInTheDocument()
  },
}
