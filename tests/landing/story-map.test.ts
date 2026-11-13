import { test, expect } from '@playwright/test'

for (const width of [1440, 375]) {
  test(`the atlas starts drawing at the viewport edge at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ca')
    await page.evaluate(() => document.fonts.ready)
    const closing = page.locator('map-closing')
    await expect(closing).toHaveClass(/closing--pending/)
    await closing.evaluate(element => {
      scrollTo({ top: element.getBoundingClientRect().top + scrollY - innerHeight - 2, behavior: 'instant' })
    })
    await expect(closing).not.toHaveClass(/closing--revealed/)
    await page.evaluate(() => scrollBy({ top: 4, behavior: 'instant' }))
    await expect(closing).toHaveClass(/closing--revealed/)
    await expect(closing).not.toHaveClass(/closing--arrived/)
    await expect(closing.locator('picture')).toHaveCSS('animation-name', 'none')
    const opacity = await closing.locator('picture').evaluate(element => Number(getComputedStyle(element).opacity))
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(0.02)
    await expect(closing.locator('.map-event__body').first()).toHaveCSS('opacity', '0')
  })
}

for (const width of [1440, 375]) {
  test(`the atlas follows scroll and stops drawing when scrolling stops at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ca')
    await page.evaluate(() => document.fonts.ready)
    const closing = page.locator('map-closing')
    const picture = closing.locator('picture')
    const reveal = () => picture.evaluate(element => {
      const style = getComputedStyle(element)
      return { opacity: Number(style.opacity), clip: style.clipPath }
    })
    await closing.evaluate(element => {
      scrollTo({ top: element.getBoundingClientRect().top + scrollY - innerHeight + 250, behavior: 'instant' })
    })
    await expect(closing).toHaveClass(/closing--revealed/)
    await expect.poll(async () => (await reveal()).opacity).toBeGreaterThan(0)
    const partial = await reveal()
    expect(partial.opacity).toBeLessThan(1)
    // Elapsed time alone must not advance the drawing, even beyond the old 1.8s animation.
    const paused = await picture.evaluate(async element => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const style = getComputedStyle(element)
      return { opacity: Number(style.opacity), clip: style.clipPath }
    })
    expect(paused).toEqual(partial)
    await page.evaluate(() => scrollBy({ top: 200, behavior: 'instant' }))
    await expect.poll(async () => (await reveal()).opacity).toBeGreaterThan(partial.opacity)
    expect((await reveal()).clip).not.toBe(partial.clip)
    await page.evaluate(() => scrollBy({ top: -200, behavior: 'instant' }))
    await expect.poll(async () => (await reveal()).opacity).toBeCloseTo(partial.opacity, 3)
    await page.locator('footer').scrollIntoViewIfNeeded()
    await expect(picture).toHaveCSS('opacity', '1')
    await expect(picture).toHaveCSS('clip-path', 'inset(0px 0px 0%)')
  })
}

test('the atlas has an irregular soft top and stays opaque against the footer', async ({ page }) => {
  await page.goto('/ca')
  const closing = page.locator('map-closing')
  await closing.scrollIntoViewIfNeeded()
  const mask = await closing.locator('picture').evaluate(async element => {
    const url = getComputedStyle(element).maskImage.match(/url\("([^"]+)"\)/)![1]
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1000
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0, 1000, 1000)
    const alpha = (x: number, y: number) => context.getImageData(x, y, 1, 1).data[3]
    return {
      bottom: [0, 100, 300, 500, 700, 900, 999].map(x => alpha(x, 999)),
      edge: [50, 200, 350, 500, 650, 800, 950].map(x => alpha(x, 120)),
      top: alpha(500, 0),
      interior: alpha(500, 300),
    }
  })
  expect(mask.bottom.every(alpha => alpha === 255)).toBe(true)
  expect(Math.max(...mask.edge) - Math.min(...mask.edge)).toBeGreaterThan(30)
  expect(mask.top).toBeLessThan(10)
  expect(mask.interior).toBe(255)
  const mapBounds = (await closing.boundingBox())!
  const footerBounds = (await page.locator('footer').boundingBox())!
  expect(Math.abs(mapBounds.y + mapBounds.height - footerBounds.y)).toBeLessThan(1)
})

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
    await expect(markers).toHaveCount(5)
    const obstacles = await Promise.all([
      closing.getByRole('heading').boundingBox(),
      closing.locator('.map-closing__copy p').boundingBox(),
      link.boundingBox(),
    ])
    for (const marker of await markers.all()) {
      await expect(marker.locator('.map-event__body')).toHaveCSS('opacity', '0')
      const bounds = (await marker.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      for (const obstacle of obstacles) {
        const overlapX = Math.min(bounds.x + bounds.width, obstacle!.x + obstacle!.width) - Math.max(bounds.x, obstacle!.x)
        const overlapY = Math.min(bounds.y + bounds.height, obstacle!.y + obstacle!.height) - Math.max(bounds.y, obstacle!.y)
        expect(overlapX > 0 && overlapY > 0, `${width}px: ${await marker.getAttribute('data-event')} overlaps the invitation by ${overlapX}px × ${overlapY}px`).toBe(false)
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
  await expect(closing.locator('picture')).toHaveCSS('opacity', '1')
  await expect(closing.locator('picture')).toHaveCSS('clip-path', 'inset(0px)')
  await expect(closing.locator('.map-event-icon').first()).toHaveCSS('animation-name', 'none')
  await expect(closing.locator('.map-event__label')).toHaveCount(0)
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
  await expect(closing.locator('picture')).toHaveCSS('opacity', '1')
  await expect(closing.locator('picture')).toHaveCSS('clip-path', 'inset(0px 0px 0%)')
  await expect(closing.locator('.map-event__label')).toHaveCount(0)
  await expect(closing.locator('.map-event-icon')).toHaveCount(5)
  for (const image of await closing.locator('.map-event-icon').all()) {
    expect(await image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true)
  }
  await expect(closing.locator('.story-map__image')).toHaveJSProperty('complete', true)
  expect(await closing.locator('.story-map__image').evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
  await context.close()
})

for (const theme of ['light', 'dark']) {
  test(`map vignettes retain transparent paper and distinct coloured pencil marks in ${theme} mode`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/ca')
    await page.evaluate(theme => document.documentElement.dataset['poloTheme'] = theme, theme)
    const closing = page.locator('map-closing')
    await closing.scrollIntoViewIfNeeded()
    const images = closing.locator('.map-event-icon')
    await expect(images).toHaveCount(5)
    for (const image of await images.all()) {
      const drawing = await image.evaluate(async (element: HTMLImageElement) => {
        await element.decode()
        const canvas = document.createElement('canvas')
        canvas.width = element.naturalWidth
        canvas.height = element.naturalHeight
        const context = canvas.getContext('2d')!
        context.drawImage(element, 0, 0)
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
        let transparent = 0, coloured = 0
        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index + 3] === 0) transparent++
          if (pixels[index + 3] > 60 && Math.max(pixels[index], pixels[index + 1], pixels[index + 2]) - Math.min(pixels[index], pixels[index + 1], pixels[index + 2]) > 40) coloured++
        }
        return { transparent, coloured, filter: getComputedStyle(element).filter }
      })
      expect(drawing.transparent).toBeGreaterThan(1000)
      expect(drawing.coloured).toBeGreaterThan(100)
      expect(drawing.filter).toBe(theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none')
    }
  })
}

for (const path of ['/', '/es', '/ca']) {
  test(`map illustrations start undiscovered without the spider, paths, key or captions at ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(path)
    const closing = page.locator('map-closing')
    await closing.scrollIntoViewIfNeeded()
    await expect(closing.locator('.story-map svg')).toHaveCount(0)
    await expect(closing.locator('[data-event="key"], [data-event="battle"]')).toHaveCount(0)
    await expect(closing.locator('.map-event--discovered')).toHaveCount(0)
    for (const body of await closing.locator('.map-event__body').all()) await expect(body).toHaveCSS('opacity', '0')
    await expect(closing.locator('.map-event__label')).toHaveCount(0)
    await expect(closing.locator('.map-event-icon')).toHaveCount(5)
  })
}
