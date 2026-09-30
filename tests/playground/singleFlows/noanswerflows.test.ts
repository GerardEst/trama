import { test, expect } from '@playwright/test'

test.describe('Flow of no-answers nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/private/56224a4e-45df-4526-9806-342b0023627d')
  })

  test('can start and see all the steps till the end without interaction', async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/noanswerflows\.test$/)

    const title = page.getByRole('heading', { name: /noanswerflows\.test/ })
    await expect(title).toBeVisible()
    await expect(page).toHaveTitle(await title.innerText())

    await expect(page.getByText('node 1')).toBeVisible()
    await expect(page.getByText('node 2')).toBeVisible()
    await expect(page.getByText('end node')).toBeVisible()
  })
})
