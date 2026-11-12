import { test, expect, type Page } from '@playwright/test'

async function scrollVoyage(page: Page, fraction: number) {
  // Font loading can move the FAQ and the route after navigation.
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('story-voyage')).toHaveClass(/voyage--ready/)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
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
  const eased = fraction * fraction * (3 - 2 * fraction)
  await expect.poll(async () => Number(await page.locator('story-voyage').getAttribute('data-progress'))).toBeCloseTo(eased, 2)
}

for (const width of [1440, 820, 601, 375, 320]) {
  test(`the small boat eases along its drawn voyage without covering text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
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
      // Use the reached position: scroll coordinates are quantized to pixels.
      const actualProgress = Number(await voyage.getAttribute('data-progress'))
      const expected = await voyage.locator('.voyage__route').evaluate((route: SVGPathElement, progress) => {
        const distance = route.getTotalLength() * progress
        const from = route.getPointAtLength(Math.max(0, distance - 2))
        const to = route.getPointAtLength(Math.min(route.getTotalLength(), distance + 2))
        return (Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI + 90 + 360) % 360
      }, actualProgress)
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

test('the boat disperses the ink behind it and restores the route on reverse scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await scrollVoyage(page, 0)
  const voyage = page.locator('story-voyage')
  const first = voyage.locator('.voyage__ink').first()
  const last = voyage.locator('.voyage__ink').last()
  const initialOpacity = await first.getAttribute('opacity')
  const lastOpacity = await last.getAttribute('opacity')

  await scrollVoyage(page, 0.6)
  await expect(first).toHaveAttribute('opacity', '0')
  await expect(last).toHaveAttribute('opacity', lastOpacity!)
  const wake = await voyage.locator('.voyage__ripple').evaluateAll(paths => paths.filter(path =>
    Number(path.getAttribute('opacity')) > 0 && path.getAttribute('transform') !== null,
  ).length)
  expect(wake).toBeGreaterThan(0)
  const smudges = await voyage.locator('.voyage__ink').evaluateAll(paths => paths.filter(path =>
    Number(path.getAttribute('opacity')) > 0 && (path as SVGElement).style.filter.includes('blur'),
  ).length)
  expect(smudges).toBeGreaterThan(0)

  await scrollVoyage(page, 0)
  await expect(first).toHaveAttribute('opacity', initialOpacity!)
  await expect(first).toHaveCSS('filter', 'none')
  expect(await voyage.locator('.voyage__ripple').evaluateAll(paths => paths.every(path =>
    path.getAttribute('opacity') === '0',
  ))).toBe(true)
})

for (const width of [1440, 375]) {
  test(`the atlas draws on entry and only its events wait for the boat at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const closing = page.locator('map-closing')
    const remainingDistance = () => page.locator('story-voyage').evaluate(voyage => {
      const route = voyage.querySelector<SVGPathElement>('.voyage__route')!
      const destination = route.getPointAtLength(route.getTotalLength())
      const root = voyage.getBoundingClientRect()
      const boat = voyage.querySelector('.voyage__boat')!.getBoundingClientRect()
      return Math.hypot(boat.x + boat.width / 2 - root.x - destination.x, boat.y + boat.height / 2 - root.y - destination.y)
    })
    await scrollVoyage(page, 0.85)
    await expect(closing).toHaveClass(/closing--visible/)
    await expect(closing).toHaveClass(/closing--revealed/)
    await expect(closing).not.toHaveClass(/closing--arrived/)
    const mapOpacity = await closing.locator('picture').evaluate(element => Number(getComputedStyle(element).opacity))
    expect(mapOpacity).toBeGreaterThan(0)
    expect(mapOpacity).toBeLessThan(1)
    await expect(closing.getByRole('heading')).toBeVisible()
    for (const marker of await closing.locator('.map-event__body').all()) {
      await expect(marker).toHaveCSS('opacity', '0')
    }

    await scrollVoyage(page, 1)
    await expect(closing).toHaveClass(/closing--arrived/)
    expect(await remainingDistance()).toBeLessThan(1)
    await expect(closing.locator('.story-map')).toHaveCSS('opacity', '1')
    await expect(closing.getByRole('heading')).toBeVisible()
    const delays = await closing.locator('.map-event__body').evaluateAll(markers => markers.map(marker =>
      parseFloat(getComputedStyle(marker).transitionDelay),
    ).sort((a, b) => a - b))
    expect(delays).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1, 1.2])
    for (const marker of await closing.locator('.map-event__body').all()) {
      await expect(marker).toHaveCSS('opacity', '1')
    }
    // Rewinding the voyage must hide events until the boat arrives again.
    await scrollVoyage(page, 0.85)
    expect(await remainingDistance()).toBeGreaterThan(1)
    await expect(closing).not.toHaveClass(/closing--arrived/)
    const fadingOpacity = await closing.locator('.map-event__body').first().evaluate(element => Number(getComputedStyle(element).opacity))
    expect(fadingOpacity).toBeGreaterThan(0)
    expect(fadingOpacity).toBeLessThan(1)
    for (const marker of await closing.locator('.map-event__body').all()) {
      await expect(marker).toHaveCSS('opacity', '0')
      await expect(marker).toHaveCSS('animation-name', 'none')
    }
    await expect(closing.getByRole('heading')).toBeVisible()
    await scrollVoyage(page, 1)
    await expect(closing).toHaveClass(/closing--arrived/)
    for (const marker of await closing.locator('.map-event__body').all()) {
      await expect(marker).toHaveCSS('opacity', '1')
    }
  })
}

test('the route adapts when an answer is expanded and the viewport changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
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
  await page.goto('/')
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
  await page.goto('/')
  await page.locator('#faq').scrollIntoViewIfNeeded()
  await expect(page.locator('.voyage__boat svg')).toBeVisible()
  await expect(page.locator('.voyage__chart')).toBeHidden()
  await expect(page.locator('story-voyage')).not.toHaveClass(/voyage--ready/)
  await context.close()
})


test('the course enters the wide map through its actual northern water channel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
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
