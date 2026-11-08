import { test, expect } from '@playwright/test'

for (const width of [1440, 820, 375, 320]) {
  test(`the author landing flows from the playable story through the editor at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')

    await expect(page.locator('.hero__foot, #toolkit, polo-board')).toHaveCount(0)
    await expect(page.locator('main > section')).toHaveCount(6)
    await expect(page.locator('#authoring button')).toHaveCount(4)
    await expect(page.locator('#features .feature-card')).toHaveCount(6)
    await expect(page.locator('#trust article')).toHaveCount(3)
    await expect(page.locator('story-demo#try-it')).toHaveCount(1)
    const image = page.locator('#try-it .demo__scene img')
    await expect(image).toHaveJSProperty('complete', true)
    const imageBox = await image.boundingBox()
    const sceneBox = await page.locator('#try-it .demo__scene').boundingBox()
    expect(imageBox!.width).toBeCloseTo(sceneBox!.width, 0)
    expect(imageBox!.height).toBeCloseTo(sceneBox!.height, 0)
    expect(imageBox!.width / imageBox!.height).toBeCloseTo(1368 / 768, 2)
    await expect(page.locator('.nav__links a[href="/#features"]')).toHaveCount(1)
    // Pricing is not on the landing for now.
    await expect(page.locator('#pricing')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}

test('reveals the closing scene when it scrolls into view', async ({ page }) => {
  await page.goto('/')
  const closing = page.locator('closing-scene')
  await expect(closing).toHaveClass(/closing--pending/)
  await closing.scrollIntoViewIfNeeded()
  await expect(closing).toHaveClass(/closing--revealed/)
  await expect(closing).not.toHaveClass(/closing--pending/)
  await expect(closing.getByRole('link', { name: /Create your first story/ })).toHaveCSS('opacity', '1')
})

test('shows the closing scene without animation when motion is reduced', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const closing = page.locator('closing-scene')
  await expect(closing.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(closing).not.toHaveClass(/closing--pending/)
})

test('signed-in readers go to their dashboard instead of signing up again', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sb-lsemostpqoguehpsbzgu-auth-token', '{"access_token":"x"}'))
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav.getByRole('link', { name: 'Log in' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/dashboard')
  await expect(page.locator('.hero').getByRole('link', { name: /Open your dashboard/ })).toHaveAttribute('href', '/dashboard')
})

test('describes the page for search engines and link previews', async ({ page }) => {
  await page.goto('/ca')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://trama.app/ca')
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', 'https://trama.app/')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/trama\.app\/_astro\//)
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}')
  expect(data).toMatchObject({ '@type': 'WebApplication', name: 'Trama', inLanguage: 'ca' })
})
