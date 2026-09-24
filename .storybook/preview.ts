import type { Preview } from '@storybook/angular'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Authoring theme',
      toolbar: {
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (story, context) => {
      document.documentElement.dataset['storybookTheme'] = context.globals['theme'] === 'dark' ? 'dark' : 'light'
      return story()
    },
  ],
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
