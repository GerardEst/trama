import type { Preview } from '@storybook/angular'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Design System',
          [
            'Overview',
            'Foundations',
            ['*'],
            'Atoms',
            ['*'],
            'Molecules',
            ['*'],
            'Organisms',
            ['*'],
          ],
          'Board',
          ['Molecules', ['*'], 'Organisms', ['*']],
          '*',
        ],
      },
    },
  },
}

export default preview
