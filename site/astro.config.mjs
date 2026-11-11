// @ts-check
import { createReadStream, existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, fontProviders } from 'astro/config'

// The site shares the theme, the example story and the engine with the app.
const appSource = fileURLToPath(new URL('../src', import.meta.url))
const engineSource = fileURLToPath(new URL('../packages/engine/src/index.ts', import.meta.url))
const fonts = '../src/assets/fonts'
const appAssets = fileURLToPath(new URL('../src/assets', import.meta.url))

/**
 * The live boards (<trama-board>, built into public/embed) use the app's icons
 * from /assets. In production the app serves them from the same origin; the
 * site's dev server has no app next to it, so it serves them from the source.
 */
const appAssetsInDev = {
  name: 'trama-app-assets-in-dev',
  /** @param {import('vite').ViteDevServer} server */
  configureServer(server) {
    const types = { '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' }
    server.middlewares.use('/assets', (request, response, next) => {
      const path = normalize(decodeURIComponent((request.url ?? '').split('?')[0]))
      const file = join(appAssets, path)
      if (!file.startsWith(appAssets) || !existsSync(file)) return next()
      response.setHeader('Content-Type', types[/** @type {keyof typeof types} */ (extname(file))] ?? 'application/octet-stream')
      createReadStream(file).pipe(response)
    })
  },
}

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
    // Landing lab (src/lab): each direction's fonts. Keep only the chosen one's.
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-instrument-serif',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-instrument-sans',
      weights: ['400 700'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      weights: ['200 800'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'DM Mono',
      cssVariable: '--font-dm-mono',
      weights: [400, 500],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['monospace'],
    },
    {
      provider: fontProviders.google(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-schibsted',
      weights: ['400 900'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['300 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['serif'],
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
    plugins: [appAssetsInDev],
  },
})
