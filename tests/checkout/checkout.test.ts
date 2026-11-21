import { expect, Page, test } from '@playwright/test'
import { environment as production } from '../../src/environments/environment'
import { environment as development } from '../../src/environments/environment.development'

const environment = process.env['CI'] ? production : development

// Synthetic auth only. Stripe and Supabase requests are intercepted: no account or charge is created.
// Creator is free for now, so these check that nothing opens its checkout.
test.use({ storageState: { cookies: [], origins: [] } })

async function mockCheckout(page: Page, options: { invalidPassword?: boolean; confirmEmail?: boolean; signedIn?: boolean } = {}) {
  const user = {
    id: '00000000-0000-4000-8000-000000000091', email: 'verified+author@example.com',
    aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '',
  }
  const exp = Math.floor(Date.now() / 1000) + 3600
  const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp, role: 'authenticated' }))}.test`
  const session = { access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
  let checkoutVisits = 0
  let oauthRedirect = ''
  await page.route('https://buy.stripe.com/**', async route => {
    checkoutVisits++
    await route.fulfill({ contentType: 'text/html', body: '<h1>Mock Stripe checkout</h1>' })
  })
  await page.route(`${environment.apiUrl}/**`, async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/auth/v1/token') {
      if (options.invalidPassword) return route.fulfill({ status: 400, json: { error: 'invalid_grant', error_description: 'Invalid login credentials' } })
      return route.fulfill({ json: session })
    }
    if (url.pathname === '/auth/v1/signup') return route.fulfill({ json: options.confirmEmail ? user : session })
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user })
    if (url.pathname === '/rest/v1/profiles') return route.fulfill({ json: [{ plan: null, subscription_status: '', user_name: 'Author', next_payment: '' }] })
    if (url.pathname === '/auth/v1/authorize') {
      oauthRedirect = url.searchParams.get('redirect_to') || ''
      return route.fulfill({ contentType: 'text/html', body: '<h1>Mock OAuth provider</h1>' })
    }
    return route.abort()
  })
  if (options.signedIn) {
    const key = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
    await page.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session })
  }
  return { user, checkoutVisits: () => checkoutVisits, oauthRedirect: () => oauthRedirect }
}

// Creator is free for now: links that still name it only open the sign-up.
for (const period of ['monthly', 'yearly'] as const) {
  test(`old Creator ${period} links register for free and open the dashboard, never Stripe`, async ({ page }) => {
    const backend = await mockCheckout(page)
    await page.goto(`/login?mode=register&plan=creator&period=${period}`)
    await expect(page.locator('.checkoutSummary, .checkoutNotice')).toHaveCount(0)
    await page.getByLabel('User name', { exact: true }).fill('Author')
    await page.getByLabel('Your email', { exact: true }).fill('submitted@example.com')
    await page.locator('#register_password').fill('test-password')
    await page.locator('form').getByRole('button', { name: 'Register', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    expect(backend.checkoutVisits()).toBe(0)
  })
}

test('failed login never opens checkout or grants a plan', async ({ page }) => {
  const backend = await mockCheckout(page, { invalidPassword: true })
  await page.goto('/login?mode=login&plan=creator&period=monthly')
  await page.getByLabel('Your email', { exact: true }).fill('submitted@example.com')
  await page.getByLabel('Your password', { exact: true }).fill('wrong-password')
  await page.locator('form').getByRole('button', { name: 'Login', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Could not sign in')
  expect(backend.checkoutVisits()).toBe(0)
  await expect(page).toHaveURL(/\/login\?/)
})

test('email confirmation is asked for without any checkout', async ({ page }) => {
  const backend = await mockCheckout(page, { confirmEmail: true })
  await page.goto('/login?mode=register&plan=creator&period=yearly')
  await page.getByLabel('User name', { exact: true }).fill('Author')
  await page.getByLabel('Your email', { exact: true }).fill('submitted@example.com')
  await page.locator('#register_password').fill('test-password')
  await page.locator('form').getByRole('button', { name: 'Register', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Check your inbox' })).toBeVisible()
  expect(backend.checkoutVisits()).toBe(0)
})

for (const period of ['monthly', 'yearly']) {
  test(`old Pro ${period} registration URLs cannot trigger a subscription or a Creator purchase`, async ({ page }) => {
    const backend = await mockCheckout(page)
    await page.goto(`/login?mode=login&plan=pro&period=${period}`)
    await expect(page.getByRole('alert')).toContainText('cannot be bought yet')
    await expect(page.locator('.checkoutSummary')).toHaveCount(0)
    await page.getByLabel('Your email', { exact: true }).fill('submitted@example.com')
    await page.getByLabel('Your password', { exact: true }).fill('test-password')
    await page.locator('form').getByRole('button', { name: 'Login', exact: true }).click()
    await expect(page.locator('form button')).not.toHaveAttribute('aria-busy', 'true')
    expect(backend.checkoutVisits()).toBe(0)
    await expect(page).toHaveURL(/plan=pro/)
  })
}

test('OAuth from an old Creator link returns to the dashboard, never to Stripe', async ({ page }) => {
  const backend = await mockCheckout(page)
  await page.goto('/login?mode=register&plan=creator&period=yearly')
  await page.getByRole('button', { name: /Register with Google/ }).click()
  await expect(page.getByRole('heading', { name: 'Mock OAuth provider' })).toBeVisible()
  const callback = new URL(backend.oauthRedirect())
  expect(callback.origin).toBe(new URL(environment.baseRoute).origin)
  expect(callback.pathname).toBe('/dashboard')
  expect(callback.searchParams.has('checkout')).toBe(false)
  expect(backend.checkoutVisits()).toBe(0)
})

test('an old checkout callback never opens Stripe', async ({ page }) => {
  const backend = await mockCheckout(page, { signedIn: true })
  await page.goto('/login?mode=login&plan=creator&period=yearly&checkout=continue')
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(backend.checkoutVisits()).toBe(0)
})
