import { test, expect } from '@playwright/test'

for (const width of [1440, 820, 375, 320]) {
  test(`the simplified landing flows from the playable story into pricing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')

    await expect(page.locator('.hero__foot, #toolkit, #features, polo-board')).toHaveCount(0)
    await expect(page.locator('main > section')).toHaveCount(3)
    await expect(page.locator('#try-it polo-game')).toHaveCount(1)
    await expect(page.locator('a[href="#features"]')).toHaveCount(0)
    await expect(page.locator('#pricing')).toBeVisible()
    await expect(page.locator('.export-license__price')).toHaveText('299€')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}
