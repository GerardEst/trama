import { test, expect } from '@playwright/test'

test.describe.only('no-answer flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      'http://localhost:4200/private/deab6603-cb1b-4060-85f6-36188d7b99d2'
    )
  })

  test('can start and see the first step of the flow', async ({ page }) => {
    // Title is on the tab
    await expect(page).toHaveTitle('TEST - no answer')

    const title = page.getByText(/TEST - no answer/)
    await title.waitFor()
    expect(title).toBeInViewport()

    const firstStep = page.getByText('Node with no answers')
    await firstStep.waitFor()
    expect(firstStep).toBeVisible()
  })

  test('loads the second step of the flow without any interaction', async ({
    page,
  }) => {
    const secondStep = page.getByText('Answer following the node')
    await secondStep.waitFor()
    expect(secondStep).toBeVisible()
  })

  test('loads last step followed by answers', async ({ page }) => {
    const lastStep = page.getByText('final no-answer flow destination')
    await lastStep.waitFor()
    expect(lastStep).toBeVisible()

    const answer = page.getByText('final answers')
    await answer.waitFor()
    expect(answer).toBeVisible()
  })
})
