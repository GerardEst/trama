import { test, expect, type Page } from '@playwright/test'
import { environment } from '../../src/environments/environment'

// No real session or database: intercept every backend request before navigating.
test.use({ storageState: { cookies: [], origins: [] } })

async function openWorkspace(page: Page) {
  const authorId = '00000000-0000-4000-8000-000000000021'
  const storyId = '00000000-0000-4000-8000-000000000022'
  const user = {
    id: authorId, email: 'workspace-test@example.com', aud: 'authenticated', role: 'authenticated',
    app_metadata: {}, user_metadata: {}, created_at: '2024-01-01T00:00:00Z',
  }
  const expiresAt = Math.floor(Date.now() / 1000) + 3600
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const session = {
    access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: authorId, exp: expiresAt, role: 'authenticated' })}.invalid-test-signature`,
    refresh_token: 'test-workspace-refresh', token_type: 'bearer',
    expires_at: expiresAt, expires_in: 3600, user,
  }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  await page.addInitScript(({ authKey, session, storyId }) => {
    localStorage.setItem(authKey, JSON.stringify(session))
    localStorage.setItem('polo-id', storyId)
    localStorage.setItem('polo-lang', 'en')
  }, { authKey, session, storyId })

  await page.route(`${environment.apiUrl}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/auth/v1/user') {
      await route.fulfill({ json: user })
    } else if (path === '/rest/v1/profiles') {
      await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Story author', next_payment: '2030-01-01' }] })
    } else if (path === '/rest/v1/stories') {
      await route.fulfill({ json: [{
        id: storyId, name: 'The garden of branching paths',
        tree: { nodes: [
          { id: 'node_0', type: 'content', text: 'Every story starts with a choice.', top: 5000, left: 5000, answers: [
            { id: 'answer_0', text: 'Follow the path', join: ['node_1'] },
          ] },
          { id: 'node_1', type: 'end', text: 'A new chapter awaits.', top: 5000, left: 5420 },
        ], refs: {}, categories: [] },
        tracking: false, sharing: false, tapLink: false, cumulativeMode: false,
        footer: {}, custom_id: null,
      }] })
    } else {
      await route.abort()
    }
  })
  await page.goto('/dashboard')
  await expect(page.getByLabel('Story name', { exact: true })).toHaveValue('The garden of branching paths')
}

for (const theme of ['light', 'dark'] as const) {
  test(`workspace uses the home identity in ${theme} mode (mocked backend)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.setViewportSize({ width: 1440, height: 960 })
    await openWorkspace(page)
    await expect(page.getByRole('link', { name: 'Trama', exact: true })).toHaveAttribute('href', '/')
    await expect(page.getByRole('link', { name: 'Docs', exact: true })).toHaveAttribute('href', '/docs/features')
    await expect(page.getByRole('button', { name: 'The garden of branching paths', exact: true })).toHaveAttribute('aria-current', 'true')
    await expect(page.locator('.board')).toHaveCSS('background-color', theme === 'light' ? 'rgb(251, 249, 244)' : 'rgb(27, 33, 29)')
    await expect(page.locator('.node').first()).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)')
    await expect(page.getByRole('button', { name: 'Create new story', exact: true })).toHaveCSS('background-color', 'rgb(246, 206, 106)')
    await page.screenshot({ path: test.info().outputPath(`workspace-${theme}.png`) })
    await page.getByRole('button', { name: 'Story options', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Export JSON', exact: true })).toBeVisible()
    await expect(page.locator('.dropdown')).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)')
    await page.getByRole('button', { name: 'Story options', exact: true }).click()
    await page.getByRole('button', { name: 'Your account', exact: true }).click()
    await expect(page.locator('polo-profile-modal .modal')).toBeVisible()
    await expect(page.locator('polo-profile-modal .modal')).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)')
    const nightMode = page.getByRole('switch')
    await nightMode.setChecked(theme !== 'dark')
    await expect(page.locator('.board')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(251, 249, 244)' : 'rgb(27, 33, 29)')
  })
}

test('the unpinned sidebar hides, floats near the edge, and stays open only when pinned (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await openWorkspace(page)
  const sidebar = page.getByRole('navigation', { name: 'Your stories', exact: true })
  const menu = page.locator('polo-menu .menu')
  const panelRight = () => sidebar.evaluate(element => element.getBoundingClientRect().right)
  const panelHeight = () => sidebar.evaluate(element => element.getBoundingClientRect().height)
  const fixedHeight = await panelHeight()

  await sidebar.getByRole('button', { name: 'Toggle menu', exact: true }).click()
  // Do not blur the clicked control: minimizing must not leave the panel stuck open.
  await page.mouse.move(900, 700)
  await expect.poll(panelRight).toBeLessThanOrEqual(0)

  // The whole left edge must be reachable, not just the hamburger button.
  await page.mouse.move(4, 300)
  await expect.poll(panelRight).toBeGreaterThan(200)
  await expect(menu).not.toHaveClass(/fixedMenu/)
  expect(await panelHeight()).toBeLessThan(fixedHeight)
  await page.screenshot({ path: test.info().outputPath('workspace-floating-menu.png') })
  await sidebar.getByRole('button', { name: 'The garden of branching paths', exact: true }).click()
  await page.mouse.move(900, 700)
  await expect.poll(panelRight).toBeLessThanOrEqual(0)

  // Moving from the reveal button into the floating panel must not close it.
  await page.locator('.openMenu').hover()
  await expect.poll(panelRight).toBeGreaterThan(200)
  await sidebar.getByRole('link', { name: 'Docs', exact: true }).hover()
  await expect.poll(panelRight).toBeGreaterThan(200)
  const floatingBox = await sidebar.boundingBox()
  await page.mouse.move(120, floatingBox!.y + floatingBox!.height + 40)
  await expect.poll(panelRight).toBeLessThanOrEqual(0)

  await page.locator('.openMenu').getByRole('button', { name: 'Toggle menu', exact: true }).click()
  await page.mouse.move(900, 700)
  await expect(menu).toHaveClass(/fixedMenu/)
  await expect.poll(panelRight).toBeGreaterThan(200)
  expect(await panelHeight()).toBe(fixedHeight)
})

test('mobile menus fit the viewport and the sidebar can be reopened (mocked backend)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.setViewportSize({ width: 375, height: 812 })
  await openWorkspace(page)
  const sidebar = page.getByRole('navigation', { name: 'Your stories', exact: true })
  const top = page.locator('polo-menu-top .menu')
  const sidebarBox = await sidebar.boundingBox()
  const topBox = await top.boundingBox()
  expect(sidebarBox!.y).toBeGreaterThanOrEqual(topBox!.y + topBox!.height)
  expect(sidebarBox!.x + sidebarBox!.width).toBeLessThanOrEqual(375)
  await page.screenshot({ path: test.info().outputPath('workspace-mobile.png') })

  await sidebar.getByRole('button', { name: 'Toggle menu', exact: true }).click()
  await page.mouse.move(370, 400)
  await expect.poll(() => sidebar.evaluate(element => element.getBoundingClientRect().right)).toBeLessThanOrEqual(0)
  await expect(page.locator('polo-menu .menu')).not.toHaveClass(/fixedMenu/)
  await page.locator('.openMenu').getByRole('button', { name: 'Toggle menu', exact: true }).click()
  await expect(page.locator('polo-menu .menu')).toHaveClass(/fixedMenu/)

  await page.getByRole('button', { name: 'Story options', exact: true }).click()
  const dropdown = page.locator('.dropdown')
  await expect(dropdown).toBeVisible()
  const box = await dropdown.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(375)
  expect(box!.y + box!.height).toBeLessThanOrEqual(812)
})
