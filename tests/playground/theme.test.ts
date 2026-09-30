import { test, expect } from '@playwright/test'

test('default playground shares the dashboard palette and remembers night mode', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('polo-theme', 'light'))
  await page.goto('/private/33a780d7-77ae-40f8-b899-f184d7a9a40c')

  const playground = page.locator('main.playground')
  await expect(playground).toHaveCSS('background-color', 'rgb(244, 246, 249)')
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(playground).toHaveCSS('background-color', 'rgb(22, 29, 42)')

  await page.reload()
  await expect(playground).toHaveCSS('background-color', 'rgb(22, 29, 42)')
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
})
