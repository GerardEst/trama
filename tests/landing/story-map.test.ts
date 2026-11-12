import { test, expect } from '@playwright/test'

for (const width of [1440, 820, 601, 375, 320]) {
  test(`the landing map keeps the closing invitation readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ca')
    const closing = page.locator('map-closing')
    await closing.scrollIntoViewIfNeeded()
    await expect(closing).toHaveClass(/closing--revealed/)
    await expect(closing.getByRole('heading', { name: 'Què passa després?' })).toBeVisible()
    const link = closing.getByRole('link', { name: /Crea la teva primera història/ })
    await expect(link).toHaveAttribute('href', '/login?mode=register&plan=creator&period=monthly')
    const box = await link.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    const image = closing.locator('.story-map__image')
    await expect(image).toHaveJSProperty('complete', true)
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
    await expect(closing.locator('.story-map')).toHaveCSS('opacity', '1')
    const markers = closing.locator('.map-event')
    await expect(markers).toHaveCount(7)
    const obstacles = await Promise.all([
      closing.getByRole('heading').boundingBox(),
      closing.locator('.map-closing__copy p').boundingBox(),
      link.boundingBox(),
    ])
    for (const marker of await markers.all()) {
      await expect(marker.locator('.map-event__body')).toHaveCSS('opacity', '1')
      const bounds = (await marker.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      for (const obstacle of obstacles) {
        const overlapX = Math.min(bounds.x + bounds.width, obstacle!.x + obstacle!.width) - Math.max(bounds.x, obstacle!.x)
        const overlapY = Math.min(bounds.y + bounds.height, obstacle!.y + obstacle!.height) - Math.max(bounds.y, obstacle!.y)
        expect(overlapX > 0 && overlapY > 0).toBe(false)
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}

test('the landing map is complete when motion is reduced', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/ca')
  const closing = page.locator('map-closing')
  await closing.scrollIntoViewIfNeeded()
  await expect(closing).not.toHaveClass(/closing--pending/)
  await expect(closing.locator('.story-map')).toHaveCSS('animation-name', 'none')
  await expect(closing.locator('.story-map')).toHaveCSS('opacity', '1')
  await expect(closing.locator('.spark').first()).toHaveCSS('animation-name', 'none')
  await expect(closing.locator('.map-event__label')).toHaveCount(7)
  await expect(closing.getByRole('link', { name: /Crea la teva primera història/ })).toBeVisible()
})

test('the landing closing invitation works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/ca')
  const closing = page.locator('map-closing')
  await closing.scrollIntoViewIfNeeded()
  await expect(closing.getByRole('heading', { name: 'Què passa després?' })).toBeVisible()
  await expect(closing.getByRole('link', { name: /Crea la teva primera història/ })).toHaveAttribute('href', '/login?mode=register&plan=creator&period=monthly')
  await expect(closing.locator('.story-map')).toHaveCSS('opacity', '1')
  await expect(closing.locator('.map-event__label')).toHaveCount(7)
  await expect(closing.locator('.spark').first()).toHaveCSS('animation-play-state', 'paused')
  await expect(closing.locator('.story-map__image')).toHaveJSProperty('complete', true)
  expect(await closing.locator('.story-map__image').evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
  await context.close()
})

test('map markers animate only while the closing section is visible', async ({ page }) => {
  await page.goto('/ca')
  const closing = page.locator('map-closing')
  const spark = closing.locator('.spark').first()
  await expect(spark).toHaveCSS('animation-play-state', 'paused')
  await closing.scrollIntoViewIfNeeded()
  await expect(spark).toHaveCSS('animation-play-state', 'running')
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(spark).toHaveCSS('animation-play-state', 'paused')
})

for (const [path, battle, treasure] of [
  ['/', 'A battle', 'A hidden treasure'],
  ['/es', 'Una batalla', 'Un tesoro oculto'],
  ['/ca', 'Una batalla', 'Un tresor amagat'],
]) {
  test(`map events follow the page language at ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(path)
    const closing = page.locator('map-closing')
    await closing.scrollIntoViewIfNeeded()
    await expect(closing.locator('[data-event="battle"] .map-event__label')).toHaveText(battle)
    await expect(closing.locator('[data-event="treasure"] .map-event__label')).toHaveText(treasure)
  })
}
