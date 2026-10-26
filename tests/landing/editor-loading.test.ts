import { test, expect, Response } from '@playwright/test'

test.describe('Landing story experience', () => {
  test('plays without loading the board or rich-text editor', async ({ page }) => {
    const editorScripts: string[] = []
    const inspected: Promise<void>[] = []
    page.on('response', (response: Response) => {
      if (response.request().resourceType() !== 'script') return
      inspected.push(response.text().then(
        (body) => {
          if (body.includes('tiptap')) editorScripts.push(response.url())
        },
        () => undefined
      ))
    })

    await page.goto('/')
    const hero = page.locator('.hero')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('You write')
    await expect(hero.getByRole('button', { name: 'Blade — cross the bridge of sentries' })).toBeVisible()
    await expect(hero.getByRole('button', { name: 'Shadow — climb the haunted stair' })).toBeVisible()
    await expect(page.locator('polo-board')).toHaveCount(0)
    await expect(page.locator('#features')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await Promise.all(inspected)
    expect(editorScripts).toEqual([])
  })

  test('finishes a story and takes readers to Creator registration', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Blade — cross the bridge of sentries' }).click()
    await expect(page.locator('#try-it')).toContainText('Stone sentries block the bridge')
    await page.getByRole('button', { name: 'Fight through. Cut the spirit free.' }).click()
    await page.getByRole('button', { name: 'Sever its shadow with your blade' }).click()
    await expect(page.locator('#try-it')).toContainText('you all leave together')

    const create = page.locator('#try-it').getByRole('link', { name: /Create your first story/ })
    await expect(create).toBeVisible()
    await create.click()
    await expect(page).toHaveURL(/\/login\?mode=register/)
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.locator('.checkoutSummary')).toContainText('Creator · 5.95€/month')
  })

  test('follows the other ending and restarts without a board', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Start over' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Shadow — climb the haunted stair' }).click()
    await expect(page.locator('#try-it')).toContainText('You climb unseen among sleeping ghosts')
    await page.getByRole('button', { name: 'Steal the moon sigil' }).click()
    await page.getByRole('button', { name: 'Fit the stolen sigil into the crown' }).click()
    await expect(page.locator('#try-it').getByRole('link', { name: /Create your first story/ })).toBeVisible()
    await page.getByRole('button', { name: 'Start over' }).click()
    await expect(page.getByRole('button', { name: 'Blade — cross the bridge of sentries' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Shadow — climb the haunted stair' })).toBeVisible()
    await expect(page.locator('#try-it').getByRole('link', { name: /Create your first story/ })).toHaveCount(0)
    await expect(page.locator('polo-board')).toHaveCount(0)
  })

  for (const width of [375, 390, 820]) {
    test(`keeps the demo and expanded plans usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('/')
      await page.getByRole('link', { name: 'Play a story' }).click()
      await page.getByRole('button', { name: 'Shadow — climb the haunted stair' }).click()
      await expect(page.locator('#try-it')).toContainText('You climb unseen among sleeping ghosts')
      await expect(page.locator('polo-board')).toHaveCount(0)
      await expect(page.locator('#features')).toBeVisible()
      await page.getByText('What’s included in Creator', { exact: true }).click()
      await expect(page.locator('.pricing__details li').filter({ hasText: 'Player tracking and story analytics' })).toBeVisible()
      const pro = page.locator('.pricing__plan--pro')
      await pro.scrollIntoViewIfNeeded()
      await expect(pro).toContainText('Pro is not available yet')
      await expect(page.locator('.export-license')).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    })
  }

  test('keeps the planned one-time Pro reference separate from Creator subscription billing', async ({ page }) => {
    await page.goto('/')
    const pricing = page.locator('#pricing')
    const pro = pricing.locator('.pricing__plan--pro')
    await expect(pricing.locator('.pricing__plan')).toHaveCount(2)
    await expect(pro).toContainText('Around 200€')
    await expect(pro).toContainText('not a final offer')
    await expect(pro.locator('button, a')).toHaveCount(0)
    await pricing.getByRole('button', { name: /Annual billing/ }).click()
    await expect(pricing.getByText('49.95€/year', { exact: true })).toBeVisible()
    await expect(pro).toContainText('Around 200€')
    await expect(pricing).not.toContainText('Basic')
  })

  test('offers available plans and keyboard-accessible annual billing', async ({ page }) => {
    await page.goto('/')
    const pricing = page.locator('#pricing')
    await expect(pricing.locator('.pricing__plan')).toHaveCount(2)
    await expect(pricing.getByText('In development')).toHaveCount(0)
    await expect(pricing.getByText('5.95€/month', { exact: true })).toBeVisible()
    const annual = pricing.getByRole('button', { name: /Annual billing/ })
    await annual.focus()
    await page.keyboard.press('Enter')
    await expect(annual).toHaveAttribute('aria-pressed', 'true')
    await expect(pricing.getByText('49.95€/year', { exact: true })).toBeVisible()
    await pricing.getByRole('button', { name: 'Choose Creator' }).click()
    await expect(page).toHaveURL(/mode=register.*plan=creator.*period=yearly/)
  })
})
