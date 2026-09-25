import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect, userEvent, within } from '@storybook/test'
import { AnchoredPopoverComponent } from './anchored-popover.component'
import { AnchoredPopoverContentDirective } from './anchored-popover-content.directive'

const renderPopover = (
  args: Pick<AnchoredPopoverComponent, 'closeOnEscape'>,
  atEdge = false
) => ({
  props: args,
  template: `
    <polo-anchored-popover
      #popover
      [closeOnEscape]="closeOnEscape"
      ${atEdge ? 'style="position: fixed; right: 1.5rem; bottom: 1.5rem"' : ''}
    >
      <button
        popoverTrigger
        type="button"
        aria-haspopup="dialog"
        [attr.aria-expanded]="popover.isOpen"
        aria-controls="storybook-anchored-dialog"
        (click)="popover.open()"
        style="padding: .7rem 1rem; border: 1px solid var(--polo-color-border); border-radius: .65rem; background: var(--polo-color-surface); color: var(--polo-color-text); cursor: pointer"
      >
        Open contextual dialog
      </button>
      <ng-template poloPopoverContent>
        <section
          id="storybook-anchored-dialog"
          role="dialog"
          aria-labelledby="storybook-anchored-title"
          style="box-sizing: border-box; width: 100%; padding: 1.5rem; border: 1px solid var(--polo-color-border); border-radius: 1rem; background: var(--polo-color-surface); color: var(--polo-color-text); box-shadow: var(--polo-shadow-popover)"
        >
          <h2 id="storybook-anchored-title" style="font-size: 1.25rem; margin: 0 0 .5rem">
            Contextual dialog
          </h2>
          <p style="margin: 0 0 1rem; line-height: 1.5">
            This content is rendered only while the popover is open. Resize the canvas to see it flip or scroll.
          </p>
          <button
            type="button"
            (click)="popover.close()"
            style="padding: .5rem .75rem; border: 1px solid var(--polo-color-border); border-radius: .5rem; background: var(--polo-color-surface-subtle); color: var(--polo-color-text); cursor: pointer"
          >Close</button>
        </section>
      </ng-template>
    </polo-anchored-popover>
  `,
})

const meta: Meta<AnchoredPopoverComponent> = {
  title: 'Design System/Molecules/Anchored popover',
  component: AnchoredPopoverComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [AnchoredPopoverContentDirective] }),
    componentWrapperDecorator(
      (story) => `<div style="min-height: 36rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  parameters: { layout: 'fullscreen' },
  argTypes: { closeOnEscape: { control: 'boolean' } },
  args: { closeOnEscape: true },
  render: (args) => renderPopover(args),
}

export default meta
type Story = StoryObj<AnchoredPopoverComponent>

export const Default: Story = {}

export const NearBottomRight: Story = {
  render: (args) => renderPopover(args, true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open contextual dialog' }))
    await expect(canvas.getByRole('dialog', { name: 'Contextual dialog' })).toBeInTheDocument()
  },
}
