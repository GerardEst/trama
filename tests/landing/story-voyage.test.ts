import { test, expect, type Page } from '@playwright/test'

async function scrollVoyage(page: Page, fraction: number) {
  await page.evaluate(fraction => {
    const voyage = document.querySelector('story-voyage')!
    const route = voyage.querySelector<SVGPathElement>('.voyage__route')!
    const top = voyage.getBoundingClientRect().top + scrollY
    const start = route.getPointAtLength(0)
    const end = route.getPointAtLength(route.getTotalLength())
    const from = top + start.y - innerHeight * 0.72
    const to = top + end.y - innerHeight * 0.48
    window.scrollTo({ top: from + (to - from) * fraction, behavior: 'instant' })
  }, fraction)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect.poll(async () => Number(await page.locator('story-voyage').getAttribute('data-progress'))).toBeCloseTo(fraction, 2)
}

for (const width of [1440, 820, 601, 375, 320]) {
  test(`the small boat turns along a permanent drawn voyage without covering text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/lab/e')
    await page.evaluate(() => document.fonts.ready)
    const voyage = page.locator('story-voyage')
    await expect(voyage).toHaveClass(/voyage--ready/)
    const boat = voyage.locator('.voyage__boat')
    let trail = ''
    const angles: number[] = []
    for (const progress of [0, 0.3, 0.6, 0.85, 1]) {
      await scrollVoyage(page, progress)
      const strokes = voyage.locator('.voyage__trail path')
      expect(await strokes.count()).toBeGreaterThan(15)
      const drawn = await strokes.evaluateAll(paths => paths.map(path => path.getAttribute('d')).join('|'))
      if (progress === 0) trail = drawn
      else expect(drawn).toBe(trail)
      const angle = await boat.evaluate(element => {
        const matrix = new DOMMatrix(getComputedStyle(element).transform)
        return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI
      })
      angles.push((angle + 360) % 360)
      const expected = await voyage.locator('.voyage__route').evaluate((route: SVGPathElement, progress) => {
        const distance = route.getTotalLength() * progress
        const from = route.getPointAtLength(Math.max(0, distance - 2))
        const to = route.getPointAtLength(Math.min(route.getTotalLength(), distance + 2))
        return (Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI + 90 + 360) % 360
      }, progress)
      const difference = Math.abs((angle - expected + 540) % 360 - 180)
      expect(difference).toBeLessThan(1)
      const bounds = (await boat.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      const text = await voyage.locator('#e-faq-title, .lq, .map-closing__copy h2, .map-closing__copy p, .map-closing__copy a').all()
      for (const element of text) {
        const obstacle = (await element.boundingBox())!
        const overlapX = Math.min(bounds.x + bounds.width, obstacle.x + obstacle.width) - Math.max(bounds.x, obstacle.x)
        const overlapY = Math.min(bounds.y + bounds.height, obstacle.y + obstacle.height) - Math.max(bounds.y, obstacle.y)
        expect(overlapX > 0 && overlapY > 0, `${width}px at ${progress}: ${await element.getAttribute('class')} ${await element.getAttribute('id')} (${overlapX}, ${overlapY})`).toBe(false)
      }
    }
    const map = (await page.locator('map-closing').boundingBox())!
    const destination = (await boat.boundingBox())!
    expect(destination.y).toBeGreaterThan(map.y)
    expect(destination.y + destination.height).toBeLessThan(map.y + map.height * 0.4)
    expect(Math.max(...angles) - Math.min(...angles)).toBeGreaterThan(20)
    await expect(boat.locator('svg')).toBeVisible()
    const size = await boat.evaluate(element => parseFloat(getComputedStyle(element).width))
    expect(size).toBeLessThanOrEqual(36)
    await scrollVoyage(page, 0)
    expect(await voyage.locator('.voyage__trail path').evaluateAll(paths => paths.map(path => path.getAttribute('d')).join('|'))).toBe(trail)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}

test('the route adapts when an answer is expanded and the viewport changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/lab/e')
  const voyage = page.locator('story-voyage')
  await expect(voyage).toHaveClass(/voyage--ready/)
  const before = await voyage.locator('.voyage__route').getAttribute('d')
  await page.locator('#faq details').nth(1).locator('summary').click()
  await expect(voyage.locator('.voyage__route')).not.toHaveAttribute('d', before!)
  await page.setViewportSize({ width: 375, height: 800 })
  await expect(voyage.locator('.voyage__chart')).toHaveAttribute('viewBox', /^0 0 375 /)
  await scrollVoyage(page, 1)
  const boat = (await voyage.locator('.voyage__boat').boundingBox())!
  const map = (await page.locator('map-closing').boundingBox())!
  expect(boat.y).toBeGreaterThan(map.y)
  expect(boat.x).toBeGreaterThan(0)
  expect(boat.x + boat.width).toBeLessThan(375)
})

test('reduced motion shows a complete, static voyage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/lab/e')
  const voyage = page.locator('story-voyage')
  await expect(voyage).toHaveAttribute('data-progress', '1.000')
  expect(await voyage.locator('.voyage__trail path').count()).toBeGreaterThan(15)
  const transform = await voyage.locator('.voyage__boat').getAttribute('style')
  await page.locator('map-closing').scrollIntoViewIfNeeded()
  await expect(voyage.locator('.voyage__boat')).toHaveAttribute('style', transform!)
})

test('the boat remains a static drawing without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/lab/e')
  await page.locator('#faq').scrollIntoViewIfNeeded()
  await expect(page.locator('.voyage__boat svg')).toBeVisible()
  await expect(page.locator('.voyage__chart')).toBeHidden()
  await expect(page.locator('story-voyage')).not.toHaveClass(/voyage--ready/)
  await context.close()
})


test('the course enters the wide map through its actual northern water channel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/lab/e')
  await scrollVoyage(page, 1)
  const waterPoints = await page.locator('story-voyage').evaluate(voyage => {
    const root = voyage.getBoundingClientRect()
    const map = voyage.querySelector('map-closing')!.getBoundingClientRect()
    const image = voyage.querySelector('.story-map__image')!
    const [x, y] = getComputedStyle(image).objectPosition.split(' ').map(value => parseFloat(value) / 100)
    const scale = Math.max(map.width / 1984, map.height / 1024)
    const left = (map.width - 1984 * scale) * x
    const top = map.top - root.top + (map.height - 1024 * scale) * y
    const route = voyage.querySelector<SVGPathElement>('.voyage__route')!
    const points: { x: number, y: number }[] = []
    for (let distance = 0; distance < route.getTotalLength(); distance += 2) {
      const point = route.getPointAtLength(distance)
      if (point.y >= top && point.y < top + 75 * scale) {
        points.push({ x: (point.x - left) / scale, y: (point.y - top) / scale })
      }
    }
    return points
  })
  expect(waterPoints.length).toBeGreaterThan(10)
  // Geographic edges read from the drawing: land lies west of this inlet and
  // the northern peninsula is east of it. The old arrival crossed that peninsula.
  expect(waterPoints[0].x).toBeGreaterThan(385)
  expect(waterPoints[0].x).toBeLessThan(440)
  for (const point of waterPoints) {
    expect(point.x).toBeLessThan(500)
    expect(point.x).toBeGreaterThan(400)
  }
})
