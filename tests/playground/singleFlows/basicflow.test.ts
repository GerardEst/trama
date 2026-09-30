import { test, expect } from '@playwright/test'

test.describe('Basic flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/private/33a780d7-77ae-40f8-b899-f184d7a9a40c')
  })

  test('can see the first question', async ({ page }) => {
    // Title is on the tab
    await expect(page).toHaveTitle(/basicflow\.test$/)

    // The tab title and the visible story heading stay in sync.
    const title = page.getByRole('heading', { name: /basicflow\.test/ })
    await expect(title).toBeVisible()
    await expect(page).toHaveTitle(await title.innerText())

    // Authored answers remain visible, but only connected answers are playable.
    await expect(page.getByText('node 1')).toBeVisible()
    await expect(page.getByRole('button', { name: 'answer 1' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'answer 1' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'answer 2' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'answer 2' })).toBeDisabled()
  })

  test('can complete the test till the end', async ({ page }) => {
    // When we click first answer
    await page.getByText('answer 1').waitFor()
    await page.getByText('answer 1').click()

    // We see the text and answers of the second step
    const text = page.getByText('node 2')
    await expect(text).toBeVisible()

    const answer = page.getByText('node2 answer')
    await expect(answer).toBeVisible()
    await answer.click()

    // Can see text for final node
    await expect(page.getByText('end node')).toBeVisible()

    // Can see and use the share action.
    await expect(page.getByRole('button', { name: 'Share this story' })).toBeVisible()
  })
})
