import type { Meta, StoryObj } from '@storybook/angular'
import { componentWrapperDecorator } from '@storybook/angular'
import { fn } from '@storybook/test'
import { ImageComponent } from './image.component'

const meta: Meta<ImageComponent> = {
  title: 'Board/Molecules/Node image',
  component: ImageComponent,
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="width: 24rem; padding: 3rem; background: var(--polo-color-canvas);">${story}</div>`
    ),
  ],
  args: {
    canDelete: true,
    onRemoveImage: fn(),
  },
}

export default meta
type Story = StoryObj<ImageComponent>

export const Optimizing: Story = {
  args: {
    loading: true,
    loadingMessage: 'Optimizing image',
  },
}
export const UploadError: Story = {
  args: {
    loading: false,
    loadingMessage: 'The image is too big\nTry again with a smaller image.',
  },
}
