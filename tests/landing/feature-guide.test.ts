import { test, expect } from '@playwright/test'

const featureIds = [
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

test('the simplified landing keeps the guide accessible through Docs', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#toolkit, polo-landing-features, .hero__foot')).toHaveCount(0)
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Docs' }).click()
  await expect(page).toHaveURL(/\/docs\/features$/)
  await expect(page).toHaveTitle('Feature guide — Trama')
  await expect(page.locator('.guide-chapter')).toHaveCount(11)
  await expect(page.locator('.guide-chapter__summary').first()).toHaveCSS(
    'font-size',
    '16px'
  )
  await expect(page.locator('.guide-chapter li').first()).toHaveCSS(
    'list-style-type',
    'decimal'
  )
  const index = page.getByRole('navigation', {
    name: 'Feature index',
    exact: true,
  })
  await expect(index.getByRole('link')).toHaveCount(11)
  for (const id of featureIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
    await expect(index.locator(`a[href$="#${id}"]`)).toHaveCount(1)
  }
  await expect(page.locator('polo-board, polo-game')).toHaveCount(0)
})

test('feature links and direct URLs land on the relevant chapter without loading a story or text editor', async ({
  page,
}) => {
  const storyRequests: string[] = []
  page.on('request', (request) => {
    if (/\/rest\/v1\/(stories|nodes)(\?|$)/.test(request.url()))
      storyRequests.push(request.url())
  })
  await page.goto('/docs/features#focus-mode')
  await expect(page).toHaveURL(/\/docs\/features#focus-mode$/)
  const focus = page.getByRole('region', {
    name: 'Focus mode for long passages',
  })
  await expect(focus).toBeInViewport()
  await expect(focus).toBeFocused()
  await expect(focus).toContainText('Ctrl+F or ⌘F')
  await page.reload()
  await expect(focus).toBeInViewport()
  await expect(focus).toBeFocused()
  const index = page.getByRole('navigation', {
    name: 'Feature index',
    exact: true,
  })
  await index
    .getByRole('link', { name: 'Distributor nodes', exact: true })
    .click()
  await expect(page).toHaveURL(/#distributors$/)
  const distributor = page.getByRole('region', {
    name: 'Distributor nodes',
    exact: true,
  })
  await expect(distributor).toBeInViewport()
  await expect(distributor).toContainText('first matching route wins')
  await expect(
    page.locator('polo-board, polo-game, polo-rich-text-editor')
  ).toHaveCount(0)
  expect(storyRequests).toEqual([])
  await page
    .getByRole('link', { name: 'Create your first story', exact: true })
    .click()
  await expect(page).toHaveURL(/\/login\?mode=register$/)
})

for (const width of [375, 820]) {
  test(`the landing and guide stay readable and navigable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBe(width)
    await page.locator('.footer a[href="/docs/features"]').click()
    await expect(page.locator('.guide-chapter')).toHaveCount(11)
    if (width < 761) {
      const contents = page.locator('.guide-mobile-index')
      await contents.locator('summary').click()
      const index = page.getByRole('navigation', {
        name: 'Mobile feature index',
      })
      await expect(index.getByRole('link')).toHaveCount(11)
      await index
        .getByRole('link', { name: 'Groups and movable frames', exact: true })
        .click()
    } else {
      await page
        .getByRole('navigation', { name: 'Feature index', exact: true })
        .getByRole('link', { name: 'Groups and movable frames', exact: true })
        .click()
    }
    await expect(page).toHaveURL(/#organisation$/)
    await expect(
      page.getByRole('region', { name: 'Groups and movable frames' })
    ).toBeInViewport()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBe(width)
  })
}
