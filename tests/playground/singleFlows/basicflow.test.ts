import { test, expect } from '@playwright/test'

test.describe('Basic flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/private/33a780d7-77ae-40f8-b899-f184d7a9a40c')
  })

  test('can see the first question', async ({ page }) => {
    // Title is on the tab
    await expect(page).toHaveTitle('basicflow.test')

    // There is a title on top
    const title = page.getByText(/basicflow.test/)
    await title.waitFor()
    expect(title).toBeVisible()

    // There is a text
    const text = page.getByText('node 1')
    await text.waitFor()
    expect(text).toBeVisible()

    // There are the answers
    const answer1 = page.getByText('answer 1')
    await answer1.waitFor()
    expect(answer1).toBeVisible()

    const answer2 = page.getByText('answer 2')
    await answer2.waitFor()
    expect(answer2).toBeVisible()
  })

  test('can complete the test till the end', async ({ page }) => {
    // When we click first answer
    await page.getByText('answer 1').waitFor()
    await page.getByText('answer 1').click()

    // We see the text and answers of the second step
    const text = page.getByText('node 2')
    await text.waitFor()
    expect(text).toBeVisible()

    const answer = page.getByText('node2 answer')
    await answer.waitFor()
    await answer.click()

    // Can see text for final node
    const finalText = page.getByText('end node')
    await finalText.waitFor()
    expect(finalText).toBeVisible()

    // Can see and use the link
    const finalLink = page.getByText('Share this story')
    await finalLink.waitFor()
    expect(finalLink).toBeVisible()
  })
})
