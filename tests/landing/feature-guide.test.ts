import { test, expect, type Page } from '@playwright/test'

const featureIds = [
  'content-nodes',
  'events',
  'conditional-paths',
  'requirements',
  'distributors',
  'connections',
  'player-input',
  'variables',
  'images',
  'share-node',
  'focus-mode',
  'organisation',
]

const featureIndex = (page: Page) => page.getByRole('navigation', { name: 'Feature index', exact: true })

test('the author landing keeps the guide accessible through Docs', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#features .e-chapter')).toHaveCount(4)
  await expect(page.locator('#features board-demo')).toHaveCount(4)
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Docs' }).click()
  await expect(page).toHaveURL(/\/docs\/features$/)
  await expect(page).toHaveTitle('Docs — Trama')
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Docs' }))
    .toHaveAttribute('aria-current', 'page')
  await expect(page.locator('.chapter')).toHaveCount(featureIds.length)
  await expect(page.locator('.chapter__summary').first()).toHaveCSS('font-size', '16px')
  await expect(page.locator('.chapter li').first()).toHaveCSS('list-style-type', 'decimal')
  await expect(featureIndex(page).getByRole('link')).toHaveCount(featureIds.length)
  for (const id of featureIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
    await expect(featureIndex(page).locator(`a[href$="#${id}"]`)).toHaveCount(1)
  }
  await expect(page.locator('polo-root, polo-board, polo-story-player')).toHaveCount(0)
})

test('content-node help has a directly linkable documentation chapter', async ({ page }) => {
  await page.goto('/docs/features#content-nodes')
  const chapter = page.getByRole('region', { name: 'Content nodes', exact: true })
  await expect(chapter).toBeInViewport()
  await expect(chapter).toBeFocused()
  await expect(chapter).toContainText('A content node is a scene')
  await expect(chapter).toContainText('Connect each answer to its destination node')
  await expect(chapter).toContainText('Answers need a connected destination')
})

test('feature links and direct URLs land on the relevant chapter without loading a story or text editor', async ({
  page,
}) => {
  const storyRequests: string[] = []
  page.on('request', request => {
    if (/\/rest\/v1\/(stories|nodes)(\?|$)/.test(request.url())) storyRequests.push(request.url())
  })
  await page.goto('/docs/features#focus-mode')
  await expect(page).toHaveURL(/\/docs\/features#focus-mode$/)
  const focus = page.getByRole('region', { name: 'Focus mode for long passages' })
  await expect(focus).toBeInViewport()
  await expect(focus).toBeFocused()
  await expect(focus).toContainText('Ctrl+F or ⌘F')
  await page.reload()
  await expect(focus).toBeInViewport()
  await expect(focus).toBeFocused()
  await featureIndex(page).getByRole('link', { name: 'Distributor nodes', exact: true }).click()
  await expect(page).toHaveURL(/#distributors$/)
  const distributor = page.getByRole('region', { name: 'Distributor nodes', exact: true })
  await expect(distributor).toBeInViewport()
  await expect(distributor).toBeFocused()
  await expect(distributor).toContainText('first matching route wins')
  await expect(page.locator('polo-board, polo-story-player, polo-rich-text-editor')).toHaveCount(0)
  expect(storyRequests).toEqual([])
  await page.getByRole('link', { name: 'Open the editor', exact: true }).click()
  await expect(page).toHaveURL(/\/login\?mode=register&plan=creator&period=monthly$/)
})

test('explains current limitations instead of advertising unsupported behaviour', async ({ page }) => {
  await page.goto('/docs/features')
  await expect(page.locator('#content-nodes')).toContainText('Answers need a connected destination')
  await expect(page.locator('#requirements')).toContainText('filtered out')
  await expect(page.locator('#distributors')).toContainText('first matching route wins')
  await expect(page.locator('#share-node')).toContainText('External links take readers to your profiles')
  await expect(page.locator('#share-node')).not.toContainText('paid subscription')
  await expect(page.locator('#organisation')).toContainText('do not change the story’s logic')
  await expect(page.locator('#player-input')).toContainText('fixed Continue button')
  await expect(page.locator('#variables')).toContainText('variable picker handles those IDs')
})

test('every language has its own guide, linked to the others', async ({ page }) => {
  for (const [lang, path, title, setup, notes] of [
    ['en', '/docs/features', 'Docs', 'Setup', 'Notes and limitations'],
    ['es', '/es/docs/features', 'Documentación', 'Configuración', 'Notas y limitaciones'],
    ['ca', '/ca/docs/features', 'Documentació', 'Configuració', 'Notes i limitacions'],
  ] as const) {
    await page.addInitScript(language => localStorage.setItem('polo-lang', language), lang)
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('h1')).toHaveText(title)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('.chapter h3').first()).toHaveText(setup)
    await expect(page.locator('.chapter__note span').first()).toHaveText(notes)
    await expect(page.locator('.chapter')).toHaveCount(featureIds.length)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://trama.app${path}`)
    await expect(page.locator('link[rel="alternate"][hreflang="ca"]')).toHaveAttribute(
      'href',
      'https://trama.app/ca/docs/features',
    )
    await expect(page.locator('.guide__back')).toHaveAttribute('href', lang === 'en' ? '/' : `/${lang}`)
  }
})

test('the English guide sends readers to their language, keeping the chapter', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polo-lang', 'ca'))
  await page.goto('/docs/features#events')
  await expect(page).toHaveURL(/\/ca\/docs\/features#events$/)
  await expect(page.getByRole('region', { name: 'Esdeveniments a escenes i decisions' })).toBeFocused()
})

test('the language selector opens the same page in another language', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('polo-lang')) localStorage.setItem('polo-lang', 'en')
  })
  await page.goto('/docs/features#variables')
  await page.locator('.footer language-selector').getByRole('link', { name: 'Español' }).click()
  await expect(page).toHaveURL(/\/es\/docs\/features#variables$/)
  expect(await page.evaluate(() => localStorage.getItem('polo-lang'))).toBe('es')
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the whole guide is in the page', async ({ page }) => {
    await page.goto('/es/docs/features')
    await expect(page.locator('.chapter')).toHaveCount(featureIds.length)
    await expect(page.locator('#distributors h2')).toHaveText('Nodos distribuidores')
  })
})

test('the sitemap lists every page in every language', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of ['/', '/es', '/ca', '/docs/features', '/es/docs/features', '/ca/docs/features']) {
    expect(sitemap).toContain(`<loc>https://trama.app${path}</loc>`)
  }
})

for (const width of [375, 820]) {
  test(`the landing and guide stay readable and navigable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.locator('.footer a[href="/docs/features"]').click()
    await expect(page.locator('.chapter')).toHaveCount(featureIds.length)
    if (width < 761) {
      await page.locator('.guide__mobile-index summary').click()
      const index = page.getByRole('navigation', { name: 'Mobile feature index' })
      await expect(index.getByRole('link')).toHaveCount(featureIds.length)
      await index.getByRole('link', { name: 'Groups and movable frames', exact: true }).click()
    } else {
      await featureIndex(page).getByRole('link', { name: 'Groups and movable frames', exact: true }).click()
    }
    await expect(page).toHaveURL(/#organisation$/)
    await expect(page.getByRole('region', { name: 'Groups and movable frames' })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  })
}
