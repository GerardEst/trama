import { expect, Page, test } from '@playwright/test'
import { environment as production } from '../../src/environments/environment'
import { environment as development } from '../../src/environments/environment.development'

const environment = process.env['CI'] ? production : development

// Synthetic auth only: every Supabase request is intercepted, no account is created.
test.use({ storageState: { cookies: [], origins: [] } })

const user = {
  id: '00000000-0000-4000-8000-000000000092', email: 'new+author@example.com',
  aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '',
}

function sessionFor() {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp, role: 'authenticated' }))}.test`
  return { access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
}

/** A brand-new author: no stories. `confirmEmail` makes sign-up wait for the link, `unconfirmed` makes sign-in refuse. */
async function mockNewAuthor(page: Page, options: { confirmEmail?: boolean; unconfirmed?: boolean; signedIn?: boolean } = {}) {
  const session = sessionFor()
  const calls: string[] = []
  await page.route(`${environment.apiUrl}/**`, async route => {
    const url = new URL(route.request().url())
    calls.push(url.pathname)
    if (url.pathname === '/auth/v1/token') {
      if (options.unconfirmed) return route.fulfill({ status: 400, json: { error: 'invalid_grant', error_description: 'Email not confirmed' } })
      return route.fulfill({ json: session })
    }
    if (url.pathname === '/auth/v1/signup') return route.fulfill({ json: options.confirmEmail ? user : session })
    if (url.pathname === '/auth/v1/resend') return route.fulfill({ json: {} })
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user })
    if (url.pathname === '/rest/v1/profiles') return route.fulfill({ json: [{ plan: null, subscription_status: '', user_name: 'Author', next_payment: '' }] })
    if (url.pathname === '/rest/v1/stories' && route.request().method() === 'GET') return route.fulfill({ json: [] })
    return route.abort()
  })
  if (options.signedIn) {
    const key = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
    await page.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session })
  }
  return { calls: (path: string) => calls.filter(call => call === path).length }
}

test('registers with Enter and welcomes the new author with the example first', async ({ page }) => {
  const backend = await mockNewAuthor(page)
  await page.goto('/login?mode=register')
  await page.getByLabel('User name', { exact: true }).fill('Author')
  await page.getByLabel('Your email', { exact: true }).fill('new+author@example.com')
  await page.locator('#register_password').fill('test-password')
  await page.locator('#register_password').press('Enter')

  await expect(page).toHaveURL(/\/dashboard$/)
  expect(backend.calls('/auth/v1/signup')).toBe(1)
  await expect(page.getByRole('heading', { name: 'Start your first story' })).toBeVisible()
  // No page of zeros, and one way to a blank story instead of two that look the same.
  await expect(page.locator('.activity')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'New story', exact: true })).toHaveCount(0)

  await page.getByRole('link', { name: 'Open the example' }).click()
  await expect(page).toHaveURL(/\/board$/)
  await expect(page.getByText('The Last Threshold').first()).toBeVisible()
})

test('says what each field needs instead of ignoring the click', async ({ page }) => {
  const backend = await mockNewAuthor(page)
  await page.goto('/login?mode=register')
  await page.locator('form').getByRole('button', { name: 'Register', exact: true }).click()
  await expect(page.locator('.fieldError')).toHaveText(['Fill in this field.', 'Fill in this field.', 'Fill in this field.'])
  await expect(page.locator('#register_username')).toBeFocused()

  await page.getByLabel('Your email', { exact: true }).fill('not-an-email')
  await page.locator('#register_password').fill('short')
  await page.locator('form').getByRole('button', { name: 'Register', exact: true }).click()
  await expect(page.locator('#register_email_error')).toHaveText('This email does not look right. Check it.')
  await expect(page.locator('#register_password_help')).toHaveText('Use at least 6 characters.')
  expect(backend.calls('/auth/v1/signup')).toBe(0)
})

test('after sign-up, only the address to check remains, and the link can be sent again', async ({ page }) => {
  const backend = await mockNewAuthor(page, { confirmEmail: true })
  await page.goto('/login?mode=register')
  await page.getByLabel('User name', { exact: true }).fill('Author')
  await page.getByLabel('Your email', { exact: true }).fill('new+author@example.com')
  await page.locator('#register_password').fill('test-password')
  await page.locator('form').getByRole('button', { name: 'Register', exact: true }).click()

  await expect(page.getByRole('status').filter({ hasText: 'Check your inbox' })).toContainText('new+author@example.com')
  await expect(page.locator('form')).toHaveCount(0)
  await page.getByRole('button', { name: 'Send it again' }).click()
  await expect(page.getByText('Sent again')).toBeVisible()
  expect(backend.calls('/auth/v1/resend')).toBe(1)
})

test('signing in before confirming the email says so and offers the link again', async ({ page }) => {
  const backend = await mockNewAuthor(page, { unconfirmed: true })
  await page.goto('/login')
  await page.getByLabel('Your email', { exact: true }).fill('new+author@example.com')
  await page.getByLabel('Your password', { exact: true }).fill('test-password')
  await page.getByLabel('Your password', { exact: true }).press('Enter')
  await expect(page.getByRole('alert')).toContainText('You have not confirmed your email yet')
  await page.getByRole('button', { name: 'Send it again' }).click()
  await expect(page.getByText('Sent again')).toBeVisible()
  expect(backend.calls('/auth/v1/resend')).toBe(1)
})

test('an author who is already signed in goes from the login page to their stories', async ({ page }) => {
  await mockNewAuthor(page, { signedIn: true })
  await page.goto('/login')
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('signing in opens the page that asked for it', async ({ page }) => {
  await mockNewAuthor(page)
  await page.goto('/dashboard/access')
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fdashboard%2Faccess$/)
  await page.getByLabel('Your email', { exact: true }).fill('new+author@example.com')
  await page.getByLabel('Your password', { exact: true }).fill('test-password')
  await page.getByLabel('Your password', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/\/dashboard\/access$/)
})
