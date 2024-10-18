import { test, expect } from '@playwright/test'

test.describe('Flow of story with user text inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/private/208eda98-c92b-45d7-8b7d-6ae977dc26d0')
  })

  test('can see "node 1" text but not "node 2" text', async ({ page }) => {
    // Check if "node 1" is visible on the page
    await expect(page.getByText('node 1')).toBeVisible()

    // Wait for 3 seconds
    await page.waitForTimeout(3000)

    // Check if "node 2" is not visible on the page after waiting
    const node2Locator = page.getByText('node 2')
    const isNode2Visible = await node2Locator.isVisible()
    expect(isNode2Visible).toBe(false)
  })

  test(
    'entire flow with inputs from user',
    { tag: '@interpolations' },
    async ({ page }) => {
      // Find the input field and type "User"
      const inputField = page.getByRole('textbox')
      await inputField.fill('User')

      // Find and click the continue button
      await page.getByRole('button', { name: /continue/i }).click()

      // WAIT BETWEEN NODES
      await page.waitForTimeout(1000)

      // Wait for and check the new greeting text
      const node1Text = page.getByText('Hello User')
      await expect(node1Text).toBeVisible()

      // Find the input field and type "User"
      const inputField2 = page.getByRole('textbox')
      await inputField2.fill('Prop')

      // Find and click the continue button
      await page.getByRole('button', { name: /continue/i }).click()

      // WAIT BETWEEN NODES
      await page.waitForTimeout(1000)

      // Wait for and check the new greeting text
      const node2Text = page.getByText('New prop Prop')
      await expect(node2Text).toBeVisible()
    }
  )
})
