import { test, expect, type Locator, type Page } from '@playwright/test'

async function paintStats(canvas: Locator) {
  return canvas.evaluate((element: HTMLCanvasElement) => {
    const pixels = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data
    let painted = 0, coloured = 0
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] > 30) {
        painted++
        if (Math.max(pixels[index], pixels[index + 1], pixels[index + 2]) - Math.min(pixels[index], pixels[index + 1], pixels[index + 2]) > 12) coloured++
      }
    }
    return { painted, coloured }
  })
}

async function walk(page: Page, map: Locator) {
  const bounds = (await map.boundingBox())!
  for (const [x, y] of [[0.07, 0.4], [0.16, 0.55], [0.3, 0.7]]) {
    await page.mouse.move(bounds.x + bounds.width * x, bounds.y + bounds.height * y, { steps: 12 })
  }
}

for (const [theme, width] of [['light', 1440], ['dark', 1440], ['light', 820], ['light', 375]] as const) {
  test(`footsteps reveal the coloured map around the pointer in ${theme} mode at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    await page.goto('/ca')
    await page.evaluate(theme => {
      document.documentElement.dataset['poloTheme'] = theme
      return document.fonts.ready
    }, theme)
    const map = page.locator('map-closing')
    await map.scrollIntoViewIfNeeded()
    const colour = map.locator('.story-map__colour')
    const footprints = map.locator('.story-map__footprints')
    const sources = await colour.evaluate(element => [(element as HTMLElement).dataset['colourWide'], (element as HTMLElement).dataset['colourTall']])
    expect(requests.some(url => sources.some(source => url.endsWith(source!)))).toBe(false)
    expect((await paintStats(colour)).painted).toBe(0)
    const bounds = (await map.boundingBox())!
    await page.mouse.move(bounds.x + bounds.width * 0.07, bounds.y + bounds.height * 0.4)
    await expect(map).toHaveAttribute('data-map-exploring', '')
    await walk(page, map)
    await expect(map).toHaveAttribute('data-map-exploring', '')
    await expect(map).toHaveCSS('cursor', 'none')
    const inkColour = await map.getByRole('heading').evaluate(element => getComputedStyle(element).color)
    await expect(footprints).toHaveCSS('color', inkColour)
    await expect.poll(async () => (await paintStats(footprints)).painted).toBeGreaterThan(150)
    await expect.poll(async () => (await paintStats(colour)).coloured).toBeGreaterThan(100)
    const remoteAlpha = await colour.evaluate((element: HTMLCanvasElement) =>
      element.getContext('2d')!.getImageData(Math.floor(element.width * 0.9), Math.floor(element.height * 0.15), 1, 1).data[3],
    )
    expect(remoteAlpha).toBe(0)
    const source = await colour.evaluate((element: HTMLCanvasElement, narrow) => element.dataset[narrow ? 'colourTall' : 'colourWide'], width <= 600)
    expect(requests.some(url => url.endsWith(source!))).toBe(true)
    await expect(colour).toHaveCSS('filter', theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none')
    for (const image of await map.locator('.map-event-icon').all()) {
      await expect(image).toHaveCSS('filter', theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none')
    }
    const link = map.getByRole('link')
    await link.hover()
    await expect(map).not.toHaveAttribute('data-map-exploring')
    await expect(link).toHaveCSS('cursor', 'pointer')
    await link.click({ trial: true })
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await expect.poll(async () => (await paintStats(footprints)).painted).toBe(0)
    await expect.poll(async () => (await paintStats(colour)).painted).toBe(0)
  })
}

test('the footprint trail fades away after the pointer leaves the map', async ({ page }) => {
  await page.goto('/ca')
  const map = page.locator('map-closing')
  await map.scrollIntoViewIfNeeded()
  await walk(page, map)
  await expect(map).toHaveAttribute('data-map-exploring', '')
  await page.mouse.move(0, 0)
  await expect(map).not.toHaveAttribute('data-map-exploring')
  await expect.poll(async () => (await paintStats(map.locator('.story-map__footprints'))).painted, { timeout: 7000 }).toBe(0)
  await expect.poll(async () => (await paintStats(map.locator('.story-map__colour'))).painted).toBe(0)
})

for (const width of [1440, 820, 375]) {
  test(`illustrations stay hidden until the trail reaches them at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ca')
    const map = page.locator('map-closing')
    await map.scrollIntoViewIfNeeded()
    await expect(map.locator('[data-event="battle"]')).toHaveCount(0)
    await expect(map.locator('.map-event')).toHaveCount(5)
    for (const body of await map.locator('.map-event__body').all()) await expect(body).toHaveCSS('opacity', '0')
    const first = map.locator('.map-event[data-event="treasure"]')
    const point = (await first.boundingBox())!
    await page.mouse.move(point.x + point.width / 2, point.y + point.height / 2)
    await expect(first).toHaveClass(/map-event--discovered/)
    await expect(first.locator('.map-event__body')).toHaveCSS('opacity', '1')
    await expect(map.locator('.map-event--discovered')).toHaveCount(1)
    for (const body of await map.locator('.map-event:not(.map-event--discovered) .map-event__body').all()) await expect(body).toHaveCSS('opacity', '0')
    await page.mouse.move(0, 0)
    await expect.poll(() => first.locator('.map-event__body').evaluate(element => getComputedStyle(element).opacity), { timeout: 2500, intervals: [50, 100] }).toBe('0')
    const unexplored = await map.locator('.map-event:not(.map-event--discovered)').evaluateAll(elements => elements.map(element => (element as HTMLElement).dataset['event']!))
    for (const kind of unexplored) {
      const marker = map.locator(`[data-event="${kind}"]`)
      const bounds = (await marker.boundingBox())!
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
      await expect(marker.locator('.map-event__body')).toHaveCSS('opacity', '1')
      await page.mouse.move(0, 0)
    }
    await expect(map.locator('.map-event--discovered')).toHaveCount(0, { timeout: 2500 })
  })
}

test('passing an illustration again restarts its two-second visibility window', async ({ page }) => {
  await page.clock.install()
  await page.goto('/ca')
  const map = page.locator('map-closing')
  await map.scrollIntoViewIfNeeded()
  const marker = map.locator('[data-event="treasure"]')
  const bounds = (await marker.boundingBox())!
  const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.mouse.move(x, y)
  await expect.poll(() => map.locator('.story-map__colour').evaluate((element: HTMLCanvasElement) => element.width)).toBeGreaterThan(300)
  await page.clock.runFor(32)
  await expect(marker.locator('.map-event__body')).toHaveCSS('opacity', '1')
  await page.mouse.move(0, 0)
  await page.clock.runFor(1100)
  await expect(marker).toHaveClass(/map-event--discovered/)
  await page.mouse.move(x, y)
  await page.clock.runFor(32)
  await page.mouse.move(0, 0)
  await page.clock.runFor(1100)
  await expect(marker).toHaveClass(/map-event--discovered/)
  await page.clock.runFor(1000)
  await expect(marker.locator('.map-event__body')).toHaveCSS('opacity', '0')
})

test('a missing paper boat restores the native sea cursor instead of a substitute drawing', async ({ page }) => {
  await page.route('**/*paper-boat*', route => route.abort())
  await page.goto('/ca')
  const map = page.locator('map-closing')
  await map.scrollIntoViewIfNeeded()
  const bounds = (await map.boundingBox())!
  await page.mouse.move(bounds.x + bounds.width * 0.63, bounds.y + bounds.height * 0.52)
  await expect(map).toHaveAttribute('data-map-travel', 'water')
  await expect(map).not.toHaveAttribute('data-map-exploring')
  await expect(map).not.toHaveCSS('cursor', 'none')
  await map.getByRole('link').click({ trial: true })
})

test('each pencil wave stays a single shallow line as it accelerates and fades in half a second', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.clock.install()
  await page.goto('/ca')
  await page.evaluate(() => document.fonts.ready)
  const map = page.locator('map-closing')
  await map.scrollIntoViewIfNeeded()
  const bounds = (await map.boundingBox())!
  const origin = { x: bounds.width * 0.6, y: bounds.height * 0.56 }
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.mouse.move(bounds.x + origin.x, bounds.y + origin.y)
  await expect.poll(() => map.locator('.story-map__colour').evaluate((element: HTMLCanvasElement) => element.width)).toBeGreaterThan(300)
  await page.clock.runFor(32)
  await expect(map).toHaveAttribute('data-map-travel', 'water')
  await page.mouse.move(0, 0)
  await page.clock.runFor(16)
  const waveBounds = () => map.locator('.story-map__footprints').evaluate((element: HTMLCanvasElement, origin) => {
    const bounds = element.getBoundingClientRect()
    const ratio = element.width / bounds.width
    const size = Math.round(64 * ratio)
    const pixels = element.getContext('2d')!.getImageData(Math.round((origin.x - 32) * ratio), Math.round((origin.y - 32) * ratio), size, size).data
    let left = size, right = -1, top = size, bottom = -1
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (pixels[(y * size + x) * 4 + 3] > 12) {
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
    return { width: Math.max(0, right - left + 1) / ratio, height: Math.max(0, bottom - top + 1) / ratio }
  }, origin)
  const early = await waveBounds()
  expect(early.width).toBeGreaterThan(4)
  expect(early.width).toBeLessThan(10)
  await page.clock.runFor(160)
  const middle = await waveBounds()
  expect(middle.width).toBeGreaterThan(early.width + 3)
  expect(middle.height).toBeLessThan(4)
  await page.clock.runFor(160)
  const late = await waveBounds()
  expect(late.width - middle.width).toBeGreaterThan((middle.width - early.width) * 1.4)
  expect(late.height).toBeLessThan(5)
  await page.clock.runFor(180)
  expect((await paintStats(map.locator('.story-map__footprints'))).painted).toBe(0)
})

for (const width of [1440, 820, 375]) {
  test(`the ComfyUI paper boat image replaces the walking cursor in the sea at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/ca')
    const map = page.locator('map-closing')
    await map.scrollIntoViewIfNeeded()
    const box = (await map.boundingBox())!
    const boatUrl = await map.locator('.story-map__colour').getAttribute('data-paper-boat')
    const boatLoaded = page.waitForResponse(response => response.url().endsWith(boatUrl!))
    await page.mouse.move(box.x + box.width * 0.07, box.y + box.height * 0.4)
    expect((await boatLoaded).ok()).toBe(true)
    await expect(map).toHaveAttribute('data-map-travel', 'land')
    await page.mouse.move(box.x + box.width * 0.63, box.y + box.height * 0.52, { steps: 20 })
    await expect(map).toHaveAttribute('data-map-travel', 'water')
    await expect.poll(async () => (await paintStats(map.locator('.story-map__footprints'))).painted).toBeGreaterThan(100)
    await page.mouse.move(box.x + box.width * 0.07, box.y + box.height * 0.4, { steps: 20 })
    await expect(map).toHaveAttribute('data-map-travel', 'land')
  })
}

test('enabling reduced motion clears the trail and restores the cursor', async ({ page }) => {
  await page.goto('/ca')
  const map = page.locator('map-closing')
  await map.scrollIntoViewIfNeeded()
  await walk(page, map)
  await expect(map).toHaveAttribute('data-map-exploring', '')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(map).not.toHaveAttribute('data-map-exploring')
  await expect.poll(async () => (await paintStats(map.locator('.story-map__colour'))).painted).toBe(0)
  await walk(page, map)
  await expect(map).not.toHaveAttribute('data-map-exploring')
})

test('the trail follows a stationary pointer during scroll and switches artwork after resize', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/ca')
  const map = page.locator('map-closing')
  await map.scrollIntoViewIfNeeded()
  await walk(page, map)
  await expect(map).toHaveAttribute('data-map-exploring', '')
  const before = (await map.boundingBox())!
  const pointer = { x: before.x + before.width * 0.3, y: before.y + before.height * 0.7 }
  await page.evaluate(() => scrollBy({ top: 50, behavior: 'instant' }))
  await expect.poll(() => map.locator('.story-map__footprints').evaluate((element: HTMLCanvasElement, pointer) => {
    const box = element.getBoundingClientRect()
    const x = Math.round((pointer.x - box.x) * element.width / box.width)
    const y = Math.round((pointer.y - box.y) * element.height / box.height)
    const pixels = element.getContext('2d')!.getImageData(x - 5, y - 5, 10, 10).data
    return pixels.some((value, index) => index % 4 === 3 && value > 80)
  }, pointer)).toBe(true)
  const portrait = await map.locator('.story-map__colour').getAttribute('data-colour-tall')
  const loaded = page.waitForResponse(response => response.url().endsWith(portrait!))
  await page.setViewportSize({ width: 375, height: 1000 })
  await map.scrollIntoViewIfNeeded()
  await walk(page, map)
  expect((await loaded).ok()).toBe(true)
  await expect(map).toHaveAttribute('data-map-exploring', '')
  await expect.poll(async () => (await paintStats(map.locator('.story-map__colour'))).coloured).toBeGreaterThan(100)
})

for (const mode of ['touch', 'reduced motion', 'no JavaScript', 'failed colour image'] as const) {
  test(`the static map and native cursor remain usable with ${mode}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: mode === 'touch' ? 375 : 1440, height: 1000 },
      isMobile: mode === 'touch', hasTouch: mode === 'touch',
      reducedMotion: mode === 'reduced motion' ? 'reduce' : 'no-preference',
      javaScriptEnabled: mode !== 'no JavaScript',
    })
    const page = await context.newPage()
    if (mode === 'failed colour image') await page.route('**/*story-map-colour*', route => route.abort())
    await page.goto('/ca')
    const map = page.locator('map-closing')
    await map.scrollIntoViewIfNeeded()
    if (mode === 'touch') {
      const box = (await map.boundingBox())!
      await page.touchscreen.tap(box.x + box.width * 0.1, box.y + box.height * 0.5)
    } else await walk(page, map)
    await expect(map).not.toHaveAttribute('data-map-exploring')
    await expect(map).not.toHaveCSS('cursor', 'none')
    expect((await paintStats(map.locator('.story-map__footprints'))).painted).toBe(0)
    await expect(map.locator('.story-map__image')).toHaveJSProperty('complete', true)
    await map.getByRole('link').click({ trial: true })
    await context.close()
  })
}
