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
    const hero = page.locator('.e-hero')
    const demo = page.locator('#try-it')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('You write')
    await expect(demo.getByRole('button', { name: 'Run to the lighthouse' })).toBeVisible()
    await expect(demo.getByRole('button', { name: 'Go down to the harbour for help' })).toBeVisible()
    await expect(page.locator('polo-board')).toHaveCount(0)
    await expect(page.locator('#features')).toBeVisible()
    await page.waitForLoadState('networkidle')
    await Promise.all(inspected)
    expect(editorScripts).toEqual([])
  })

  test('finishes a story and takes readers to Creator registration', async ({ page }) => {
    await page.goto('/')
    const demo = page.locator('#try-it')
    await demo.getByRole('button', { name: 'Run to the lighthouse' }).click()
    await expect(demo).toContainText('The lighthouse door is open')
    await demo.getByRole('button', { name: 'Look for oil in the storeroom' }).click()
    await demo.getByRole('button', { name: 'Light the lamp' }).click()
    await expect(demo).toContainText('The light sweeps the water again')

    const create = page.locator('#try-it').getByRole('link', { name: /Create your first story/ })
    await expect(create).toBeVisible()
    await create.click()
    await expect(page).toHaveURL(/\/login\?mode=register/)
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.locator('.checkoutSummary')).toContainText('Creator · 5.95€/month')
  })

  test('follows the other ending and restarts in the independent story demo', async ({ page }) => {
    await page.goto('/')
    const demo = page.locator('#try-it')
    await expect(demo.getByRole('button', { name: 'Start over' })).toHaveCount(0)
    await demo.getByRole('button', { name: 'Go down to the harbour for help' }).click()
    await expect(demo).toContainText('an old fisherwoman hears you out')
    await demo.getByRole('button', { name: 'Row out to the ship' }).click()
    await expect(demo).toContainText('You reach the ship with burning arms')
    await expect(demo.getByRole('link', { name: /Create your first story/ })).toBeVisible()
    await demo.getByRole('button', { name: 'Start over' }).click()
    await expect(demo.getByRole('button', { name: 'Run to the lighthouse' })).toBeVisible()
    await expect(demo.getByRole('button', { name: 'Go down to the harbour for help' })).toBeVisible()
    await expect(demo.getByRole('link', { name: /Create your first story/ })).toHaveCount(0)
    await expect(demo.locator('polo-board')).toHaveCount(0)
  })

  for (const width of [375, 390, 820]) {
    test(`keeps the demo usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('/')
      await page.getByRole('link', { name: 'Play a story' }).click()
      await page.locator('#try-it').getByRole('button', { name: 'Run to the lighthouse' }).click()
      await expect(page.locator('#try-it')).toContainText('The lighthouse door is open')
      await expect(page.locator('#try-it polo-board')).toHaveCount(0)
      await expect(page.locator('#features')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    })
  }

  test('shows the first scene before any script runs', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('#try-it')).toContainText('the lighthouse stays dark')
    await expect(page.locator('#try-it').getByRole('button', { name: 'Run to the lighthouse' })).toBeVisible()
    await expect(page.locator('#features .e-chapter')).toHaveCount(4)
    await context.close()
  })
})
