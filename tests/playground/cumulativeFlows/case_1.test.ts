import { test, expect } from '@playwright/test'

test(
  'nodes are always active nodes after a distributor node in cumulative mode',
  {
    tag: '@edgecase',
  },
  async ({ page }) => {
    await page.goto('/private/7923f542-48b6-4ddd-94e8-ce363687e7f7')

    await page.getByRole('button', { name: /answer1/i }).click()

    await page.waitForTimeout(1000)

    const endText = page.getByText('node2')
    await expect(endText).toBeVisible()

    const lastNode = page.locator('.node').filter({ hasText: 'node2' })
    await expect(lastNode).not.toHaveClass(/disabled/)
  }
)
