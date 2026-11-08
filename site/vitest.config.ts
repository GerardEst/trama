import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('../src', import.meta.url)),
      '@trama-app/engine': fileURLToPath(new URL('../packages/engine/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'happy-dom',
  },
})
