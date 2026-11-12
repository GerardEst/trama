import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

for (const theme of ['light', 'dark'] as const) {
  test(`public pages share the ${theme} preference and readable actions`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.addInitScript(() => localStorage.removeItem('polo-theme'))
    const light = theme === 'light'
    const appTheme = {
      canvas: light ? 'rgb(251, 249, 244)' : 'rgb(27, 33, 29)',
      surface: light ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)',
      action: 'rgb(246, 206, 106)',
      actionText: 'rgb(37, 39, 32)',
    }
    const landingTheme = {
      canvas: light ? 'rgb(251, 249, 243)' : 'rgb(16, 21, 29)',
      surface: light ? 'rgb(255, 255, 255)' : 'rgb(27, 34, 48)',
      action: light ? 'rgb(194, 57, 30)' : 'rgb(255, 138, 110)',
      actionText: light ? 'rgb(255, 255, 255)' : 'rgb(16, 21, 29)',
    }
    for (const { path, host, action, card, colors } of [
      { path: '/', host: 'body', action: '.e-hero .e-btn--solid', card: '.ai-out--book .ai-screen', colors: landingTheme },
      { path: '/login', host: 'polo-login', action: '.form__footer button', card: '.box', colors: appTheme },
      { path: '/docs/features', host: 'body', action: '.guide .button--primary', card: '.guide__sidebar', colors: appTheme },
    ]) {
      await page.goto(path)
      await expect(page.locator(host)).toHaveCSS('background-color', colors.canvas)
      await expect(page.locator(card).first()).toHaveCSS('background-color', colors.surface)
      await expect(page.locator(action).first()).toHaveCSS('background-color', colors.action)
      await expect(page.locator(action).first()).toHaveCSS('color', colors.actionText)
      await page.screenshot({ path: test.info().outputPath(`${theme}${path === '/' ? '-home' : path.replaceAll('/', '-')}.png`) })
    }
  })
}

test('a saved theme applies consistently to public pages on mobile', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.addInitScript(() => localStorage.setItem('polo-theme', 'dark'))
  await page.goto('/')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 21, 29)')
  await expect(page.locator('.e-hero .e-btn--solid')).toHaveCSS('background-color', 'rgb(255, 138, 110)')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
  await page.locator('.lf__links').getByRole('link', { name: 'Log in', exact: true }).click()
  await expect(page.locator('polo-login')).toHaveCSS('background-color', 'rgb(27, 33, 29)')
  await page.goto('/docs/features')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(27, 33, 29)')
  await expect(page.locator('.guide__content')).toHaveCSS('background-color', 'rgb(38, 46, 40)')
})
