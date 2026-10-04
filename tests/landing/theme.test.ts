import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

for (const theme of ['light', 'dark'] as const) {
  test(`public pages share the ${theme} theme and readable amber actions`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.addInitScript(() => localStorage.removeItem('polo-theme'))
    const canvas = theme === 'light' ? 'rgb(251, 249, 244)' : 'rgb(27, 33, 29)'
    const surface = theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)'
    for (const [path, host, action, card] of [
      ['/', 'polo-landingpage', '.hero .button--primary', '.pricing__plan'],
      ['/login', 'polo-login', '.form__footer button', '.box'],
      ['/docs/features', 'polo-feature-guide', '.guide-button', '.guide-sidebar'],
    ]) {
      await page.goto(path)
      await expect(page.locator(host)).toHaveCSS('background-color', canvas)
      await expect(page.locator(card).first()).toHaveCSS('background-color', surface)
      await expect(page.locator(action).first()).toHaveCSS('background-color', 'rgb(246, 206, 106)')
      await expect(page.locator(action).first()).toHaveCSS('color', 'rgb(37, 39, 32)')
      await page.screenshot({ path: test.info().outputPath(`${theme}-${host}.png`) })
    }
  })
}

test('a saved theme applies consistently to public pages, including mobile pricing', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.addInitScript(() => localStorage.setItem('polo-theme', 'dark'))
  await page.goto('/')
  await expect(page.locator('polo-landingpage')).toHaveCSS('background-color', 'rgb(27, 33, 29)')
  await expect(page.locator('.pricing__plan').first()).toHaveCSS('background-color', 'rgb(38, 46, 40)')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Log in', exact: true }).click()
  await expect(page.locator('polo-login')).toHaveCSS('background-color', 'rgb(27, 33, 29)')
  await page.goto('/docs/features')
  await expect(page.locator('polo-feature-guide')).toHaveCSS('background-color', 'rgb(27, 33, 29)')
})
