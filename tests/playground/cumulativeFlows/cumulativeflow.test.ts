import { test, expect } from '@playwright/test'

test(
  'can complete the entire flow',
  {
    tag: '@interpolations @noAnswerNodes @jumpToAnswers @distributors @userTextNodes',
  },
  async ({ page }) => {
    await page.goto('/private/78509b8e-ee36-4a22-880e-2a9b5e7280a2')

    await expect(page.getByText('Hello')).toBeVisible()
    await page.getByRole('textbox').fill('User')
    await page.getByRole('button', { name: /continue/i }).click()

    await page.waitForTimeout(1000)

    await expect(page.getByText('User')).toBeVisible()
    await page.getByRole('button', { name: /next/i }).click()

    await page.waitForTimeout(1000)

    await expect(page.getByText('no stop')).toBeVisible()
    await expect(page.getByText('no stop II')).toBeVisible()
    await expect(page.getByText('answers')).toBeVisible()
    await page.getByRole('button', { name: /1/i }).click()

    await expect(page.getByText('Hello')).toBeVisible()

    await page.waitForTimeout(1000)

    await expect(page.getByText('back to answers')).toBeVisible()
    await page.waitForTimeout(1000)

    await page
      .getByRole('button', { name: /distribute/i })
      .last()
      .click()

    await page.waitForTimeout(1000)

    await expect(page.getByText('end')).toBeVisible()
  }
)
