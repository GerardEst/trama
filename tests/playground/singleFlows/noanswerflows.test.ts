import { test, expect } from '@playwright/test'

test.describe('Flow of no-answers nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/private/56224a4e-45df-4526-9806-342b0023627d')
  })

  test('can start and see all the steps till the end without interaction', async ({
    page,
  }) => {
    await expect(page).toHaveTitle('noanswerflows.test')

    const title = page.getByText(/noanswerflows.test/)
    await title.waitFor()
    expect(title).toBeVisible()

    const firstStep = page.getByText('node 1')
    await firstStep.waitFor()
    expect(firstStep).toBeVisible()

    const secondStep = page.getByText('node 2')
    await secondStep.waitFor()
    expect(secondStep).toBeVisible()

    const lastStep = page.getByText('end node')
    await lastStep.waitFor()
    expect(lastStep).toBeVisible()
  })
})
