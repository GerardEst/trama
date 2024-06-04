import { test, expect } from '@playwright/test'

test.describe('playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/testStoryID')
  })

  test('can play a short basic game', async ({ page }) => {
    const button = page.getByText(/Create a story/)

    // can see the title
    // can read the correct text
    // can choose an answer and it takes me to the next node
    // the next node has the right text

    expect(button).toBeTruthy()
  })

  // Can play a game with complexities X

  // test('creates a new story when click create new story', async ({ page }) => {
  //   const button = page.getByText('+ Create a story')

  //   button.click()

  //   // // The title of the dashboard changes to My new tree
  //   // const menuTop = page.getByLabel('storyName')
  //   // await expect(menuTop).toHaveText('My new tree')

  //   // // A new story shows up on the menu

  //   await expect(page).toHaveTitle('My new tree')

  //   // Apareix un sol node buit en pantalla
  // })
})
