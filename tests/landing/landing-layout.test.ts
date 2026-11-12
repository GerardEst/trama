import { test, expect } from '@playwright/test'

for (const width of [1440, 820, 375, 320]) {
  test(`the definitive landing presents its story, live chapters and map at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('.e-hero written-world')).toHaveCount(1)
    await expect(page.locator('story-demo#try-it')).toHaveCount(1)
    await expect(page.locator('.e-chapter')).toHaveCount(4)
    await expect(page.locator('board-demo')).toHaveCount(4)
    await expect(page.locator('.st-pillar')).toHaveCount(3)
    await expect(page.locator('#compare table')).toHaveCount(1)
    await expect(page.locator('any-interface > figure')).toHaveCount(4)
    await expect(page.locator('story-voyage map-closing')).toHaveCount(1)
    await expect(page.locator('.ln__links a[href="/#features"]')).toHaveCount(1)
    await expect(page.locator('lab-bar, [data-lab], a[href*="/lab"]')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}

test('reveals the map when the closing invitation scrolls into view', async ({ page }) => {
  await page.goto('/')
  const closing = page.locator('map-closing')
  await expect(closing).toHaveClass(/closing--pending/)
  await closing.scrollIntoViewIfNeeded()
  await expect(closing).toHaveClass(/closing--revealed/)
  await expect(closing).not.toHaveClass(/closing--pending/)
  await expect(closing.getByRole('link', { name: /Create your first story/ })).toBeVisible()
})

test('shows the closing map without animation when motion is reduced', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const closing = page.locator('map-closing')
  await closing.scrollIntoViewIfNeeded()
  await expect(closing.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(closing).not.toHaveClass(/closing--pending/)
})

test('signed-in readers go to their dashboard instead of signing up again', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sb-lsemostpqoguehpsbzgu-auth-token', '{"access_token":"x"}'))
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav.getByRole('link', { name: 'Log in' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/dashboard')
  await expect(page.locator('.e-hero').getByRole('link', { name: /Open your dashboard/ })).toHaveAttribute('href', '/dashboard')
})

for (const [lang, path] of [['en', '/'], ['es', '/es'], ['ca', '/ca']]) {
  test(`${lang}: exposes the definitive page to search engines and link previews`, async ({ page, request }) => {
    await page.goto(path)
    await expect(page).not.toHaveTitle(/E ·|Quadern/)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://trama.app${path}`)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', 'https://trama.app/')
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/trama\.app\/_astro\/valley\./)
    const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}')
    expect(data.inLanguage).toBe(lang)
    expect(data['@graph']).toEqual(expect.arrayContaining([
      expect.objectContaining({ '@type': 'WebApplication', name: 'Trama' }),
      expect.objectContaining({ '@type': 'FAQPage', inLanguage: lang }),
    ]))
    await expect(page.locator('link[rel="alternate"][type="text/plain"]')).toHaveAttribute('href', '/llms-full.txt')
    const summary = await request.get('/llms-full.txt')
    expect(summary.ok()).toBe(true)
    expect(summary.headers()['content-type']).toContain('text/plain')
    expect(await summary.text()).toContain('## Capabilities')
    expect(await (await request.get('/llms.txt')).text()).toContain('https://trama.app/llms-full.txt')
  })
}
