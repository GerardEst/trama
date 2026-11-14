import { test, expect } from '@playwright/test'

const cases = [
  { id: 'writers', name: 'Creative writers', plan: 'Creative', price: '€5.95 a month' },
  { id: 'games', name: 'Narrative games', plan: 'Creative', price: '€5.95 a month' },
  { id: 'brands', name: 'Brands', plan: 'Pro', price: '€19.95 a month' },
]

test('the use cases page has a chapter for each kind of author', async ({ page }) => {
  await page.goto('/use-cases')
  await expect(page).toHaveTitle('Use cases — Trama')
  await expect(page.locator('h1')).toHaveText(/One editor\.\s*Very different stories\./)
  await expect(page.locator('.e-chapter')).toHaveCount(cases.length)
  const contents = page.getByRole('navigation', { name: 'Use cases', exact: true })
  for (const item of cases) {
    const chapter = page.locator(`#${item.id}`)
    await expect(contents.getByRole('link', { name: item.name })).toHaveAttribute('href', `#${item.id}`)
    await expect(chapter.locator('.e-chapter__name')).toHaveText(item.name)
    await expect(chapter.getByRole('heading', { level: 2 })).toHaveCount(1)
    await expect(chapter.locator(`.e-chapter__head svg.mark--${item.id}`)).toBeVisible()
    await expect(contents.locator(`svg.mark--${item.id}`)).toHaveCount(1)
    await expect(chapter.locator('.e-more dl > div')).toHaveCount(4)
    await expect(chapter.locator('.uc-plan')).toContainText(item.plan)
    await expect(chapter.locator('.uc-plan')).toContainText(item.price)
    await expect(chapter.locator('.uc-plan a')).toHaveAttribute('href', '/pricing')
  }
  await expect(page.locator('.e-chapter__n')).toHaveCount(0)
  await expect(page.locator('#brands .uc-plan')).toContainText('Coming soon')
  await expect(page.locator('#writers .uc-plan')).not.toContainText('Coming soon')
  await contents.getByRole('link', { name: 'Brands' }).click()
  await expect(page).toHaveURL(/\/use-cases#brands$/)
  await expect(page.locator('#brands .e-chapter__head')).toBeInViewport()
})

test('each use case names real features, and only analytics needs Pro', async ({ page }) => {
  await page.goto('/use-cases')
  await expect(page.locator('#games').getByRole('link', { name: 'Distributors', exact: true })).toHaveAttribute('href', '/#f-distributors')
  await expect(page.locator('.e-more .uc-tag')).toHaveCount(1)
  await expect(page.locator('#brands dt', { hasText: 'Statistics' }).locator('.uc-tag')).toHaveText('Pro')
  const targets = await page.locator('.e-more dt a').evaluateAll(links =>
    [...new Set(links.map(link => new URL((link as HTMLAnchorElement).href).hash))])
  await page.goto('/')
  for (const hash of targets) await expect(page.locator(hash)).toHaveCount(1)
})

test('the menu reaches the new pages and marks the one being read', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await nav.getByRole('link', { name: 'Use cases' }).click()
  await expect(page).toHaveURL(/\/use-cases$/)
  await expect(nav.getByRole('link', { name: 'Use cases' })).toHaveAttribute('aria-current', 'page')
  await nav.getByRole('link', { name: 'Pricing' }).click()
  await expect(page).toHaveURL(/\/pricing$/)
  await expect(nav.getByRole('link', { name: 'Pricing' })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: 'Use cases' })).not.toHaveAttribute('aria-current')
  await nav.getByRole('link', { name: 'Features' }).click()
  await expect(page).toHaveURL(/\/#features$/)
})

test('the docs menu and the footers link to the new pages too', async ({ page }) => {
  await page.goto('/docs/features')
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav.getByRole('link', { name: 'Use cases' })).toHaveAttribute('href', '/use-cases')
  await expect(nav.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing')
  await expect(page.locator('.footer a[href="/pricing"]')).toHaveCount(1)
  await page.goto('/es')
  await expect(page.locator('.footer a[href="/es/use-cases"]')).toHaveText('Casos de uso')
  await expect(page.locator('.footer a[href="/es/pricing"]')).toHaveText('Precios')
})

test('on a phone the menu folds under a button', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/use-cases')
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  const toggle = nav.getByRole('button', { name: 'Menu' })
  await expect(nav.getByRole('link', { name: 'Pricing' })).toBeHidden()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(nav.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('link', { name: 'Use cases' })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: 'Log in' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(nav.getByRole('link', { name: 'Pricing' })).toBeHidden()
  await expect(toggle).toBeFocused()
  await toggle.click()
  // Anywhere outside the menu closes it: here, the page below the open panel.
  await page.mouse.click(180, 760)
  await expect(nav.getByRole('link', { name: 'Pricing' })).toBeHidden()
  await toggle.click()
  await nav.getByRole('link', { name: 'Pricing' }).click()
  await expect(page).toHaveURL(/\/pricing$/)
  await expect(page.locator('.pp-plan')).toHaveCount(2)
})

test('the language selector keeps the reader on the same page', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('polo-lang')) localStorage.setItem('polo-lang', 'en')
  })
  await page.goto('/use-cases#games')
  await page.locator('.footer language-selector').getByRole('link', { name: 'Català' }).click()
  await expect(page).toHaveURL(/\/ca\/use-cases#games$/)
  await expect(page.locator('#games .e-chapter__name')).toHaveText('Jocs narratius')
  await page.locator('.footer a[href="/ca/pricing"]').click()
  await expect(page.locator('h1')).toContainText('per 5,95 € al mes.')
})

for (const [lang, path, title] of [
  ['en', '/use-cases', 'Use cases — Trama'],
  ['es', '/es/use-cases', 'Casos de uso — Trama'],
  ['ca', '/ca/use-cases', 'Casos d’ús — Trama'],
] as const) {
  test(`${lang}: the use cases page is published with its translations`, async ({ page, request }) => {
    await page.addInitScript(language => localStorage.setItem('polo-lang', language), lang)
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page).toHaveTitle(title)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('.e-chapter')).toHaveCount(cases.length)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://trama.app${path}`)
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', 'https://trama.app/es/use-cases')
    const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}')
    expect(data.inLanguage).toBe(lang)
    expect(data.mainEntity.itemListElement).toHaveLength(cases.length)
    expect(await (await request.get('/sitemap.xml')).text()).toContain(`<loc>https://trama.app${path}</loc>`)
    await expect(page.locator('map-closing')).toHaveCount(1)
    await expect(page.locator('polo-root')).toHaveCount(0)
  })
}

for (const width of [1440, 820, 375, 320]) {
  test(`the use cases page fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ca/use-cases')
    await expect(page.locator('.us')).toHaveCount(cases.length)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}
