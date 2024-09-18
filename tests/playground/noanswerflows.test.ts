import { test, expect } from '@playwright/test'

test.describe('Flow of no-answers nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      'http://localhost:4200/private/c420ec0b-a8ff-4479-b9a9-9f0997e3eb4a'
    )
  })

  test('can start and see all the steps till the end without interaction', async ({
    page,
  }) => {
    await expect(page).toHaveTitle('Testing - No answer node')

    const title = page.getByText(/Testing - No answer node/)
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
