import { test, expect } from '@playwright/test'

const plan = (page: import('@playwright/test').Page, name: string) => page.getByRole('article', { name, exact: true })

test('the pricing page shows both plans and switches between monthly and yearly', async ({ page }) => {
  await page.goto('/pricing')
  await expect(page).toHaveTitle('Pricing — Trama')
  await expect(page.locator('h1')).toHaveText(/The whole editor\s*for €4\.95 a month\./)
  const creative = plan(page, 'Creative')
  const pro = plan(page, 'Pro')

  await expect(page.getByRole('radio', { name: 'Monthly' })).toBeChecked()
  await expect(creative.locator('.pp-price:visible')).toContainText('€4.95')
  await expect(creative.locator('.pp-price:visible')).toContainText('or €49.95 a year')
  await expect(pro.locator('.pp-price:visible')).toContainText('€19.95')
  await expect(creative.getByRole('link', { name: /Start with Creative/ }))
    .toHaveAttribute('href', '/login?mode=register&plan=creator&period=monthly')

  await page.getByRole('radio', { name: 'Yearly' }).check()
  await expect(creative.locator('.pp-price:visible')).toHaveCount(1)
  await expect(creative.locator('.pp-price:visible')).toContainText('€49.95')
  await expect(creative.locator('.pp-price:visible')).toContainText('€4.16 a month · €9.45 less than paying monthly')
  await expect(pro.locator('.pp-price:visible')).toContainText('€199.95')
  await expect(creative.getByRole('link', { name: /Start with Creative/ }))
    .toHaveAttribute('href', '/login?mode=register&plan=creator&period=yearly')
})

test('Creative lists the whole editor and leaves analytics to Pro', async ({ page }) => {
  await page.goto('/pricing')
  const creative = plan(page, 'Creative')
  const pro = plan(page, 'Pro')
  await expect(creative.locator('.pp-chapters dt')).toHaveText(['Write', 'Give it shape', 'Give it life', 'Publish', 'Build'])
  await expect(creative.getByRole('link', { name: 'Distributors', exact: true })).toHaveAttribute('href', '/#f-distributors')
  await expect(creative.getByRole('link', { name: 'Statistics', exact: true })).toHaveCount(0)
  await expect(creative.locator('svg.mark--creative')).toBeVisible()
  await expect(pro.locator('svg.mark--pro')).toBeVisible()
  await expect(page.locator('.pp-plan__n')).toHaveCount(0)
  await expect(pro).toContainText('Everything in Creative, and also:')
  await expect(pro).toContainText('Every playthrough, recorded')
  // Pro is announced with its price, but it is not on sale yet.
  await expect(pro.locator('.pp-plan__action')).toContainText('Coming soon')
  await expect(pro.locator('.pp-plan__action').getByRole('link')).toHaveCount(0)
  await expect(page.locator('#faq')).toContainText('When can I get Pro?')
  await expect(page.locator('.pp-note')).toHaveCount(0)
})

test('every feature Creative links to exists on the landing', async ({ page }) => {
  await page.goto('/pricing')
  const targets = await plan(page, 'Creative').locator('.pp-chapters a').evaluateAll(links =>
    links.map(link => new URL((link as HTMLAnchorElement).href).hash))
  expect(targets.length).toBeGreaterThan(15)
  await page.goto('/')
  for (const hash of targets) await expect(page.locator(hash)).toHaveCount(1)
})

test('signed-in readers go to their dashboard instead of the checkout', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sb-lsemostpqoguehpsbzgu-auth-token', '{"access_token":"x"}'))
  await page.goto('/pricing')
  await expect(plan(page, 'Creative').getByRole('link', { name: /Open your dashboard/ })).toHaveAttribute('href', '/dashboard')
})

test('the pricing page ends on its questions, without the voyage or the map', async ({ page }) => {
  await page.goto('/pricing')
  const faq = page.locator('#faq')
  await expect(faq.locator('details')).toHaveCount(7)
  await expect(faq.locator('details[open]')).toContainText('Creative costs €4.95 a month')
  await faq.getByText('Do my readers pay or need an account?').click()
  await expect(faq).toContainText('Readers open the link and play, on either plan.')
  await expect(page.locator('story-voyage, map-closing')).toHaveCount(0)
  // The landing's traveller stands under the title, as decoration.
  const hero = faq.locator('img.pr-faq__hero')
  await hero.scrollIntoViewIfNeeded()
  await expect(hero).toHaveAttribute('alt', '')
  await expect.poll(() => hero.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
})

for (const [lang, path, title, price] of [
  ['en', '/pricing', 'Pricing — Trama', '€4.95'],
  ['es', '/es/pricing', 'Precios — Trama', '4,95 €'],
  ['ca', '/ca/pricing', 'Preus — Trama', '4,95 €'],
] as const) {
  test(`${lang}: the pricing page is published with its translations and offers`, async ({ page, request }) => {
    await page.addInitScript(language => localStorage.setItem('polo-lang', language), lang)
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page).toHaveTitle(title)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toContainText(price)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://trama.app${path}`)
    await expect(page.locator('link[rel="alternate"][hreflang="ca"]')).toHaveAttribute('href', 'https://trama.app/ca/pricing')
    const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}')
    expect(data.inLanguage).toBe(lang)
    const app = data['@graph'].find((item: { '@type': string }) => item['@type'] === 'WebApplication')
    expect(app.offers).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Creative (monthly)', price: '4.95', priceCurrency: 'EUR' }),
      expect.objectContaining({ name: 'Creative (yearly)', price: '49.95' }),
    ]))
    expect(app.offers).toHaveLength(2)
    expect(data['@graph']).toEqual(expect.arrayContaining([expect.objectContaining({ '@type': 'FAQPage', inLanguage: lang })]))
    expect(await (await request.get('/sitemap.xml')).text()).toContain(`<loc>https://trama.app${path}</loc>`)
    await expect(page.locator('polo-root')).toHaveCount(0)
  })
}

test('the landing quotes the same price as the pricing page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#faq')).toContainText('The Creative plan costs €4.95 a month or €49.95 a year')
  await expect(page.locator('#compare')).toContainText('€4.95 a month or €49.95 a year')
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('both plans, their prices and the menu are in the page', async ({ page }) => {
    await page.goto('/ca/pricing')
    await expect(plan(page, 'Creative')).toContainText('4,95 €')
    await expect(plan(page, 'Pro')).toContainText('19,95 €')
    await page.getByRole('radio', { name: 'Anual' }).check()
    await expect(plan(page, 'Creative').locator('.pp-price:visible')).toContainText('49,95 €')
    await expect(page.getByRole('navigation', { name: 'Navegació principal' }).getByRole('link', { name: 'Casos d’ús' })).toBeVisible()
  })
})

for (const width of [1440, 820, 375, 320]) {
  test(`the pricing page fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ca/pricing')
    await expect(page.locator('.pp-plan')).toHaveCount(2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}
