import { test, expect } from '@playwright/test'
import { copyFor } from '../../site/src/i18n'
import { atlasFor } from '../../site/src/components/landing/atlas'

const effectScript = /\/written-world-effect[^/]*\.js(?:\?|$)/

for (const device of [
  { name: 'phone', width: 390, touch: true },
  { name: 'wide touch screen', width: 1280, touch: true },
  { name: 'narrow mouse screen', width: 820, touch: false },
]) {
  test(`${device.name}: the opening image stays static without loading WebGL`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: device.width, height: 844 },
      hasTouch: device.touch,
      isMobile: device.touch,
      locale: 'en-US',
    })
    const page = await context.newPage()
    const effectRequests: string[] = []
    page.on('request', request => {
      if (effectScript.test(request.url())) effectRequests.push(request.url())
    })
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext
      const contexts: string[] = []
      Object.assign(window, { heroWebGLContexts: contexts })
      HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof getContext>) {
        if (/webgl/i.test(args[0])) contexts.push(args[0])
        return getContext.apply(this, args)
      }
    })
    await page.goto('/')
    await page.evaluate(() => customElements.whenDefined('written-world'))
    // A pointer on a small/hybrid device must not enable the desktop effect.
    await page.mouse.move(120, 250)
    await page.waitForLoadState('networkidle')
    const hero = page.locator('written-world')
    const image = hero.locator('img')
    await expect(image).toBeVisible()
    await expect(image).toHaveJSProperty('complete', true)
    expect(await image.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
    await expect(hero).not.toHaveAttribute('data-written', '')
    expect(effectRequests).toEqual([])
    expect(await page.evaluate(() => (window as Window & { heroWebGLContexts: string[] }).heroWebGLContexts)).toEqual([])
    await context.close()
  })
}

test('desktop loads the optional effect only on pointer use and restores the image on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const effectRequests: string[] = []
  page.on('request', request => {
    if (effectScript.test(request.url())) effectRequests.push(request.url())
  })
  await page.goto('/')
  await page.evaluate(() => customElements.whenDefined('written-world'))
  await page.waitForLoadState('networkidle')
  expect(effectRequests).toEqual([])
  const hero = page.locator('written-world')
  await expect(hero.locator('img')).toBeVisible()

  await page.mouse.move(120, 300)
  await expect(hero).toHaveAttribute('data-written', '', { timeout: 15000 })
  expect(effectRequests.some(url => /written-world-effect/.test(url))).toBe(true)
  await expect(hero.locator('canvas')).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(hero).not.toHaveAttribute('data-written', '')
  await expect(hero.locator('img')).toBeVisible()
  await expect(hero.locator('canvas')).toBeHidden()
})

// Each frame the cover draws its tear and its page, once. Its intro used to ask
// for the next frame twice per frame, so the draws doubled every frame until the
// page froze. The draws in each frame are counted while the intro plays.
test('desktop draws the cover once per frame while its intro tears it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.addInitScript(() => {
    let draws = 0
    const webgl = WebGLRenderingContext.prototype
    const webgl2 = WebGL2RenderingContext.prototype
    const draw = webgl.drawArrays
    const draw2 = webgl2.drawArrays
    webgl.drawArrays = function (this: WebGLRenderingContext, ...args: Parameters<typeof draw>) {
      draws++
      return draw.apply(this, args)
    }
    webgl2.drawArrays = function (this: WebGL2RenderingContext, ...args: Parameters<typeof draw2>) {
      draws++
      return draw2.apply(this, args)
    }
    Object.assign(window, { heroDraws: () => draws })
  })
  await page.goto('/')
  await page.evaluate(() => customElements.whenDefined('written-world'))
  await page.mouse.move(120, 300)
  await expect(page.locator('written-world')).toHaveAttribute('data-written', '', { timeout: 15000 })
  // The intro starts 0.7 s after the cover is drawn and tears for 1.4 s.
  const busiest = await page.evaluate(() => new Promise<number>(resolve => {
    const count = (window as Window & { heroDraws: () => number }).heroDraws
    const start = performance.now()
    let previous = count()
    let most = 0
    const frame = (now: number) => {
      const draws = count()
      most = Math.max(most, draws - previous)
      previous = draws
      if (now - start < 2600) requestAnimationFrame(frame)
      else resolve(most)
    }
    requestAnimationFrame(frame)
  }))
  expect(busiest).toBeGreaterThan(0)
  expect(busiest).toBeLessThanOrEqual(4)
})

test('reduced motion keeps the desktop hero static even on pointer use', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const effectRequests: string[] = []
  page.on('request', request => {
    if (effectScript.test(request.url())) effectRequests.push(request.url())
  })
  await page.goto('/')
  await page.evaluate(() => customElements.whenDefined('written-world'))
  await page.mouse.move(120, 300)
  await page.waitForLoadState('networkidle')
  expect(effectRequests).toEqual([])
  await expect(page.locator('written-world img')).toBeVisible()
})

for (const lang of ['en', 'es', 'ca'] as const) {
  test(`${lang}: the hero's content and metadata are available without scripts or canvas`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    const path = lang === 'en' ? '/' : `/${lang}`
    const copy = copyFor(lang)
    await page.goto(path)
    await expect(page.locator('h1')).toContainText(copy.hero.titleStart)
    await expect(page.locator('.e-hero__lead')).toHaveText(atlasFor(lang).meta.definition)
    await expect(page.locator('.e-hero').getByRole('link', { name: copy.hero.startStory })).toHaveAttribute('href', '/login?mode=register&plan=creator&period=monthly')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://trama.app${path}`)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
    const decoration = page.locator('written-world')
    await expect(decoration).toHaveAttribute('aria-hidden', 'true')
    await expect(decoration.locator('img')).toHaveAttribute('alt', '')
    await expect(decoration.locator('img')).toHaveAttribute('loading', 'eager')
    await expect(decoration.locator('img')).toHaveAttribute('fetchpriority', 'high')
    await expect(decoration.locator('img')).toBeVisible()
    await context.close()
  })
}
