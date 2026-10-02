import { test, expect } from '@playwright/test'

test.describe('with a Spanish browser', () => {
  test.use({ locale: 'es-ES' })

  test('opens the Spanish landing page on its own URL', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/es$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.locator('h1')).toContainText('Tú escribes la historia.')
    await expect(page.locator('#try-it')).toContainText(
      'llegas a la Ciudadela Hueca'
    )
    await expect(
      page.locator('link[rel="alternate"][hreflang="ca"]')
    ).toHaveAttribute('href', 'https://trama.app/ca')
  })

  test('remembers a language chosen in the selector', async ({ page }) => {
    await page.goto('/es')
    await page
      .locator('.nav-language')
      .getByRole('button', { name: 'Català' })
      .click()

    await expect(page).toHaveURL(/\/ca$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca')
    await expect(page.locator('h1')).toContainText('Tu escrius la història.')

    await page.goto('/')
    await expect(page).toHaveURL(/\/ca$/)
    await expect(page.locator('#try-it')).toContainText(
      'arribes a la Ciutadella Buida'
    )
  })

  test('keeps English when the reader chooses it', async ({ page }) => {
    await page.goto('/es')
    await page
      .locator('.nav-language')
      .getByRole('button', { name: 'English' })
      .click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('h1')).toContainText('You write the story.')
    await page.reload()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })
})

test.describe('with a Catalan browser', () => {
  test.use({ locale: 'ca-ES' })

  test('shows the reader interface in Catalan', async ({ page }) => {
    await page.goto('/not-found')
    await expect(page.getByText('No s’ha trobat la història')).toBeVisible()
  })

  test('shows a localised URL without remembering it as a choice', async ({
    page,
  }) => {
    await page.goto('/es')
    await expect(page.locator('h1')).toContainText('Tú escribes la historia.')
    expect(
      await page.evaluate(() => localStorage.getItem('polo-lang'))
    ).toBeNull()
  })
})
