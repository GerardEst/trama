import { test, expect } from '@playwright/test'

for (const width of [1440, 820, 375, 320]) {
  test(`the simplified landing flows from the playable story into pricing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')

    await expect(page.locator('.hero__foot, #toolkit, #features, polo-board')).toHaveCount(0)
    await expect(page.locator('main > section')).toHaveCount(3)
    await expect(page.locator('#try-it polo-game')).toHaveCount(1)
    const image = page.locator('#try-it .story-player__scene img')
    await expect(image).toHaveJSProperty('naturalWidth', 1368)
    const imageBox = await image.boundingBox()
    const sceneBox = await page.locator('#try-it .story-player__scene').boundingBox()
    expect(imageBox!.width).toBeCloseTo(sceneBox!.width, 0)
    expect(imageBox!.height).toBeCloseTo(sceneBox!.height, 0)
    expect(imageBox!.width / imageBox!.height).toBeCloseTo(1368 / 768, 2)
    await expect(page.locator('a[href="#features"]')).toHaveCount(0)
    await expect(page.locator('#pricing')).toBeVisible()
    await expect(page.locator('.export-license__price')).toHaveText('299€')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}

test('reveals the closing scene when it scrolls into view', async ({ page }) => {
  await page.goto('/')
  const closing = page.locator('.closing-section')
  await expect(closing).toHaveClass(/closing-section--pending/)
  await closing.scrollIntoViewIfNeeded()
  await expect(closing).toHaveClass(/closing-section--revealed/)
  await expect(closing).not.toHaveClass(/closing-section--pending/)
  await expect(closing.getByRole('link', { name: /Start your story/ })).toHaveCSS('opacity', '1')
})

test('shows the closing scene without animation when motion is reduced', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const closing = page.locator('.closing-section')
  await expect(closing.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(closing).not.toHaveClass(/closing-section--pending/)
})
