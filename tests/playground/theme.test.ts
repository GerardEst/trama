import { test, expect } from '@playwright/test'

test('default playground shares the dashboard palette and remembers night mode', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('polo-theme', 'light'))
  await page.goto('/private/33a780d7-77ae-40f8-b899-f184d7a9a40c')

  const playground = page.locator('main.playground')
  const toggle = page.getByRole('switch', { name: 'Dark mode' })
  await expect(playground).toHaveCSS('background-color', 'rgb(251, 249, 244)')
  await expect(toggle).not.toBeChecked()
  await toggle.click()
  await expect(toggle).toBeChecked()
  await expect(playground).toHaveCSS('background-color', 'rgb(27, 33, 29)')

  await page.reload()
  await expect(playground).toHaveCSS('background-color', 'rgb(27, 33, 29)')
  await expect(toggle).toBeChecked()

  // A native switch button supports both Space and Enter, with a visible focus ring.
  await toggle.focus()
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveCSS('outline-style', 'solid')
  await toggle.press('Space')
  await expect(toggle).not.toBeChecked()
  await expect(playground).toHaveCSS('background-color', 'rgb(251, 249, 244)')

  await page.reload()
  await expect(toggle).not.toBeChecked()
  await expect(playground).toHaveCSS('background-color', 'rgb(251, 249, 244)')
  await toggle.press('Enter')
  await expect(toggle).toBeChecked()
  await expect(playground).toHaveCSS('background-color', 'rgb(27, 33, 29)')
})
