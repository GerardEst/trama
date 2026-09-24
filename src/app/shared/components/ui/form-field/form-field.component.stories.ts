import type { Meta, StoryObj } from '@storybook/angular'
import { argsToTemplate, componentWrapperDecorator } from '@storybook/angular'
import { FormFieldComponent } from './form-field.component'

const controlStyles = `
  width: 100%;
  min-height: 3.75rem;
  padding: .75rem 1rem;
  color: var(--polo-color-text);
  background: var(--polo-color-surface);
  border: 1px solid var(--polo-color-border-strong);
  border-radius: .65rem;
`

const meta: Meta<FormFieldComponent> = {
  title: 'Design System/Molecules/Form field',
  component: FormFieldComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 24rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  render: (args) => ({
    props: args,
    template: `
      <polo-form-field #field ${argsToTemplate(args)}>
        <input
          id="storybook-field"
          style="${controlStyles}"
          [attr.aria-describedby]="field.descriptionId"
          [required]="field.required"
          placeholder="Enter a value"
        />
      </polo-form-field>
    `,
  }),
  args: {
    label: 'Minimum value',
    controlId: 'storybook-field',
    description: 'The answer is available when the player has at least this value.',
    required: true,
    showOptional: true,
  },
}

export default meta
type Story = StoryObj<FormFieldComponent>

export const Required: Story = {}
export const Optional: Story = {
  args: {
    label: 'New value',
    description: 'Leave empty to clear the current value.',
    required: false,
  },
}
export const WithoutDescription: Story = {
  args: {
    label: 'Condition state',
    description: undefined,
    required: true,
  },
}
