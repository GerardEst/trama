import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('http://localhost:4200/login')
  await page.getByLabel('Your email').fill('gesteve.12@gmail.com')
  await page.getByLabel('Your password').fill('123456')
  await page.getByRole('button', { name: 'Login' }).click()

  await page.waitForURL('http://localhost:4200/dashboard')

  await expect(page.getByText('Gerard')).toBeVisible()

  await page.context().storageState({ path: authFile })
})
