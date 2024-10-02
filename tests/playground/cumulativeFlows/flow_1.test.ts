import { test, expect } from '@playwright/test'

test(
  'can complete the entire flow',
  {
    tag: '@interpolations @noAnswerNodes @jumpToAnswers @distributors @userTextNodes',
  },
  async ({ page }) => {
    await page.goto('/private/197d1779-2d9b-4237-be54-718288d07604')

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

    await page.waitForTimeout(1000)

    await expect(page.getByText('back to answers')).toBeVisible()
    await page.getByRole('button', { name: /distribute/i }).click()

    await page.waitForTimeout(1000)

    await expect(page.getByText('end')).toBeVisible()
  }
)
