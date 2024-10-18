import { test as setup, expect } from '@playwright/test'
import 'dotenv/config'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('/login')
  await page.getByLabel('Your email').fill(process.env['USERNAME'] || '')
  await page.getByLabel('Your password').fill(process.env['PASSWORD'] || '')
  await page.getByRole('button', { name: 'Login' }).click()

  await page.waitForURL('/dashboard')

  await expect(page.getByText('Textandplay')).toBeVisible()

  await page.context().storageState({ path: authFile })
})
