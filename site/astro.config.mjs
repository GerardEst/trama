// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig, fontProviders } from 'astro/config'

// The site shares the theme, the example story and the engine with the app.
const appSource = fileURLToPath(new URL('../src', import.meta.url))
const engineSource = fileURLToPath(new URL('../packages/engine/src/index.ts', import.meta.url))
const fonts = '../src/assets/fonts'

export default defineConfig({
  site: 'https://trama.app',
  // Pages are files (index.html, es.html, ca.html) served without extension,
  // so the landing keeps its URLs: /, /es and /ca.
  trailingSlash: 'never',
  build: { format: 'file' },
  i18n: {
    locales: ['en', 'es', 'ca'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Raleway',
      cssVariable: '--font-raleway',
      fallbacks: ['sans-serif'],
      options: {
        variants: [{ src: [`${fonts}/Raleway-VariableFont_wght.ttf`], weight: '100 900', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Baskerville',
      cssVariable: '--font-baskerville',
      fallbacks: ['serif'],
      options: {
        variants: [
          { src: [`${fonts}/Baskervville-Regular.ttf`], weight: 400, style: 'normal' },
          { src: [`${fonts}/Baskerville-BT-Bold.ttf`], weight: 700, style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'LibreBaskerville',
      cssVariable: '--font-libre-baskerville',
      fallbacks: ['serif'],
      options: {
        variants: [
          { src: [`${fonts}/LibreBaskerville-Regular.ttf`], weight: 400, style: 'normal' },
          { src: [`${fonts}/LibreBaskerville-Bold.ttf`], weight: 700, style: 'normal' },
        ],
      },
    },
  ],
  vite: {
    resolve: {
      alias: {
        '@app': appSource,
        '@trama-app/engine': engineSource,
      },
    },
    server: { fs: { allow: ['..'] } },
  },
})
