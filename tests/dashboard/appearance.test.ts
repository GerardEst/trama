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
        tree: { entryPoint: { left: 4820, top: 4900, targetNodeId: 'node_0' }, nodes: [
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
  await page.goto('/board')
  await expect(page.getByLabel('Story name', { exact: true })).toHaveValue('The garden of branching paths')
}

for (const theme of ['light', 'dark'] as const) {
  test(`workspace uses the home identity in ${theme} mode (mocked backend)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.setViewportSize({ width: 1440, height: 960 })
    await openWorkspace(page)
    await expect(page.locator('polo-board-header').getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/dashboard')
    await expect(page.locator('polo-board-header .header')).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)')
    await expect(page.locator('.board')).toHaveCSS('background-color', theme === 'light' ? 'rgb(251, 249, 244)' : 'rgb(27, 33, 29)')
    await expect(page.locator('.node').first()).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)')
    await page.screenshot({ path: test.info().outputPath(`workspace-${theme}.png`) })
    await page.getByRole('button', { name: 'Story options', exact: true }).click()
    await expect(page.getByRole('switch', { name: 'Enable tracking', exact: true })).toBeVisible()
    await expect(page.locator('polo-story-options-modal .modal')).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Story options' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Switch project', exact: true }).click()
    await expect(page.getByRole('link', { name: 'The garden of branching paths', exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(page.locator('.switcherMenu')).toHaveCSS('background-color', theme === 'light' ? 'rgb(255, 254, 250)' : 'rgb(38, 46, 40)')
    await page.keyboard.press('Escape')
    // The guide is in the board's help; the person's settings are a step away, at Home.
    await page.getByRole('button', { name: 'Keyboard shortcuts', exact: true }).click()
    await expect(page.getByRole('link', { name: /Full guide/ })).toHaveAttribute('href', /\/docs\/features$/)
    await page.keyboard.press('Escape')
    // Night mode lives in the person's preferences, and the board follows it on return.
    await page.goto('/settings/preferences')
    await page.getByRole('switch', { name: 'Night mode', exact: true }).setChecked(theme !== 'dark')
    await page.goBack()
    await expect(page.locator('.board')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(251, 249, 244)' : 'rgb(27, 33, 29)')
  })
}

test('mobile menus fit the viewport beside the header (mocked backend)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.setViewportSize({ width: 375, height: 812 })
  await openWorkspace(page)
  // The header keeps the top row up to the story's actions, without covering them.
  const header = (await page.locator('polo-board-header .header').boundingBox())!
  const actions = (await page.locator('polo-board-actions .actions').boundingBox())!
  expect(header.x).toBeGreaterThanOrEqual(0)
  expect(header.x + header.width).toBeLessThanOrEqual(actions.x)
  expect(actions.x + actions.width).toBeLessThanOrEqual(375)
  await expect(page.getByRole('textbox', { name: 'Story name', exact: true })).toBeVisible()
  await page.screenshot({ path: test.info().outputPath('workspace-mobile.png') })

  await page.getByRole('button', { name: 'Switch project', exact: true }).click()
  const switcher = (await page.locator('.switcherMenu').boundingBox())!
  expect(switcher.x).toBeGreaterThanOrEqual(0)
  expect(switcher.x + switcher.width).toBeLessThanOrEqual(375)
  await page.keyboard.press('Escape')

  // Phones fold the analytics and the options into one menu.
  await page.getByRole('button', { name: 'More actions', exact: true }).click()
  await page.getByRole('button', { name: 'Story options', exact: true }).click()
  const dropdown = page.locator('polo-story-options-modal .modal')
  await expect(dropdown).toBeVisible()
  const box = await dropdown.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(375)
  expect(box!.y + box!.height).toBeLessThanOrEqual(812)
})
