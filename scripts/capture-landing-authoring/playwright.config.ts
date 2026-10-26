import { defineConfig } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default defineConfig({
  testDir: '.',
  testMatch: 'capture.ts',
  workers: 1,
  timeout: 45000,
  reporter: 'list',
  outputDir: join(tmpdir(), 'trama-landing-captures', 'test-results'),
  use: {
    baseURL: process.env['TRAMA_CAPTURE_BASE_URL'] ?? 'http://localhost:4200',
    viewport: { width: 1600, height: 1000 },
    locale: 'en-US',
    colorScheme: 'light',
    browserName: 'chromium',
    launchOptions: { executablePath: process.env['CHROME_BIN'] },
  },
})
