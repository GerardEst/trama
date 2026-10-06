import type { Meta, StoryObj } from '@storybook/angular'
import { argsToTemplate, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect, userEvent, within } from '@storybook/test'
import { AnchoredPopoverComponent } from '../anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from '../anchored-popover/anchored-popover-content.directive'
import { ContextualButtonComponent } from './contextual-button.component'

const meta: Meta<ContextualButtonComponent> = {
  title: 'Design System/Atoms/Contextual button',
  component: ContextualButtonComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    text: 'Add event',
    title: 'Add event',
    icon: '/assets/icons/plus.svg',
  },
}

export default meta
type Story = StoryObj<ContextualButtonComponent>

export const Default: Story = {}
export const IconOnly: Story = { args: { text: undefined } }
export const Disabled: Story = { args: { disabled: true } }
export const WithPopover: Story = {
  decorators: [moduleMetadata({ imports: [AnchoredPopoverComponent, AnchoredPopoverContentDirective] })],
  render: (args) => ({
    props: args,
    template: `
      <polo-anchored-popover #popover>
        <polo-contextual-button
          popoverTrigger
          ${argsToTemplate(args)}
          ariaHasPopup="dialog"
          [ariaExpanded]="popover.isOpen"
          (click)="popover.open()"
        ></polo-contextual-button>
        <ng-template poloPopoverContent>
          <section role="dialog" aria-label="New event">
            <button type="button" (click)="popover.close()">Close</button>
          </section>
        </ng-template>
      </polo-anchored-popover>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Add event' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await expect(await canvas.findByRole('dialog')).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    await expect(trigger).toHaveFocus()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}
