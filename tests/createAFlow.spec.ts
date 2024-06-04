import { test, expect } from '@playwright/test'

test.describe('create a new story', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/dashboard')
  })

  test('has the create a story button', async ({ page }) => {
    const button = page.getByText(/Create a story/)

    expect(button).toBeTruthy()
  })

  test('creates a new story when click create new story', async ({ page }) => {
    const button = page.getByText('+ Create a story')

    button.click()

    // // The title of the dashboard changes to My new tree
    // const menuTop = page.getByLabel('storyName')
    // await expect(menuTop).toHaveText('My new tree')

    // // A new story shows up on the menu

    await expect(page).toHaveTitle('My new tree')

    // Apareix un sol node buit en pantalla
  })
})
