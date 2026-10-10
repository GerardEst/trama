import { expect, Page, test } from '@playwright/test'
import { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// All Supabase traffic is intercepted; no real account or prepared auth state is needed.
test.use({ storageState: { cookies: [], origins: [] } })

async function mockHistoryStory(page: Page) {
  const authorId = '00000000-0000-4000-8000-000000000021'
  const storyId = '00000000-0000-4000-8000-000000000022'
  const user = { id: authorId, email: 'history-test@example.com', aud: 'authenticated', role: 'authenticated' }
  let savedTree: tree = {
    nodes: [
      { id: 'node_0', type: 'content', text: 'Start passage', top: 5000, left: 5000, join: [{ node: 'node_1' }] },
      { id: 'node_1', type: 'end', text: 'An ending', top: 5000, left: 5340 },
    ],
    refs: {}, categories: [],
  }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  await page.addInitScript(({ authKey, user, storyId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.test-signature`
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'test-refresh-token',
      token_type: 'bearer', expires_at: expiresAt, expires_in: 3600, user }))
    localStorage.setItem('polo-id', storyId)
  }, { authKey, user, storyId })
  await page.route(`${environment.apiUrl}/**`, async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/auth/v1/user') await route.fulfill({ json: user })
    else if (path === '/rest/v1/profiles') await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Test author' }] })
    else if (path === '/rest/v1/stories' && route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON()
      if (body.tree) savedTree = body.tree
      await route.fulfill({ json: { id: storyId } })
    } else if (path === '/rest/v1/stories') {
      await route.fulfill({ json: [{ id: storyId, name: 'History regression', tree: savedTree,
        tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
    } else await route.abort()
  })
  await page.setViewportSize({ width: 1600, height: 1000 })
  return { storyId, tree: () => savedTree }
}

test('undo/redo restores deletions and connections, preserves text-editor undo and saves restored states (mocked backend)', async ({ page }) => {
  const backend = await mockHistoryStory(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/dashboard')
  const undo = page.getByRole('button', { name: 'Undo', exact: true })
  const redo = page.getByRole('button', { name: 'Redo', exact: true })
  await expect(undo).toBeDisabled()
  await expect(redo).toBeDisabled()
  const start = page.locator('.node[data-board-join-node="node_0"]')
  const ending = page.locator('.node[data-board-join-node="node_1"]')
  await ending.getByRole('button', { name: 'Node options', exact: true }).click()
  await ending.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(ending).toHaveCount(0)
  await expect.poll(() => backend.tree().nodes.length).toBe(1)
  await start.locator('.node__header').focus()
  await page.keyboard.press('Control+z')
  await expect(ending).toHaveCount(1)
  await expect.poll(() => backend.tree().nodes[0].join).toEqual([{ node: 'node_1' }])
  await expect(redo).toBeEnabled()
  await page.keyboard.press('Control+Shift+z')
  await expect(ending).toHaveCount(0)
  await undo.click()
  await expect(ending).toHaveCount(1)
  await page.getByRole('button', { name: 'History regression', exact: true }).click()
  await expect(redo).toBeEnabled()
  await expect(ending).toHaveCount(1)

  await start.getByRole('textbox', { name: 'Node text', exact: true }).click()
  const text = start.locator('[contenteditable="true"]')
  await expect(text).toBeVisible()
  await text.press('End')
  await text.pressSequentially(' changed')
  await text.press('Control+z')
  await expect(ending).toHaveCount(1)
  await expect(redo).toBeEnabled()
  await text.fill('Edited passage')
  await start.locator('.node__header').focus()
  await expect.poll(() => backend.tree().nodes[0].text).toBe('<p>Edited passage</p>')
  await expect(redo).toBeDisabled()
  await undo.click()
  await expect(start.getByRole('textbox', { name: 'Node text', exact: true })).toHaveText('Start passage')
  await expect.poll(() => backend.tree().nodes[0].text).toBe('Start passage')
  await redo.click()
  await expect.poll(() => backend.tree().nodes[0].text).toBe('<p>Edited passage</p>')
  await expect(page.locator('polo-menu-top [role="status"]')).toContainText('Board changes saved')
  await page.reload()
  await expect(start.getByRole('textbox', { name: 'Node text', exact: true })).toHaveText('Edited passage')
  await expect(undo).toBeDisabled()
  await expect(redo).toBeDisabled()
  expect(errors).toEqual([])
})

test('history is discarded when navigating away from the editor and returning (mocked backend)', async ({ page }) => {
  const backend = await mockHistoryStory(page)
  await page.goto('/dashboard')
  const ending = page.locator('.node[data-board-join-node="node_1"]')
  await ending.getByRole('button', { name: 'Node options', exact: true }).click()
  await ending.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeEnabled()
  await expect(page.locator('polo-menu-top [role="status"]')).toContainText('Board changes saved')
  // Client-side navigation exercises destruction of the dashboard, not a reload.
  await page.locator('polo-menu').getByRole('link', { name: 'Docs', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/features/)
  await page.goBack()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Redo', exact: true })).toBeDisabled()
  await expect(ending).toHaveCount(0)
  expect(backend.tree().nodes).toHaveLength(1)
})

test('browser forward navigation saves a still-focused inline draft before destroying the dashboard (mocked backend)', async ({ page }) => {
  const backend = await mockHistoryStory(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/dashboard')
  await page.locator('polo-menu').getByRole('link', { name: 'Docs', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/features/)
  await page.goBack()
  await expect(page).toHaveURL(/\/dashboard/)
  const start = page.locator('.node[data-board-join-node="node_0"]')
  await start.getByRole('textbox', { name: 'Node text', exact: true }).click()
  const text = start.locator('[contenteditable="true"]')
  await expect(text).toBeVisible()
  await text.fill('Last focused draft')
  // No click or blur: the router must flush before child destruction.
  await page.goForward()
  await expect(page).toHaveURL(/\/docs\/features/)
  await expect.poll(() => backend.tree().nodes[0].text).toBe('<p>Last focused draft</p>')
  await page.goBack()
  await expect(start.getByRole('textbox', { name: 'Node text', exact: true })).toHaveText('Last focused draft')
  expect(errors).toEqual([])
})

test('many linear autosave pauses remain one undo step and preserve an earlier deletion (mocked backend)', async ({ page }) => {
  const backend = await mockHistoryStory(page)
  await page.goto('/dashboard')
  const ending = page.locator('.node[data-board-join-node="node_1"]')
  await ending.getByRole('button', { name: 'Node options', exact: true }).click()
  await ending.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(ending).toHaveCount(0)
  await page.locator('polo-menu-tree-legend').getByRole('button', { name: 'Preview', exact: true }).click()
  const linear = page.locator('polo-linear-editor')
  await linear.getByRole('button', { name: 'Edit', exact: true }).click()
  const passage = linear.getByRole('textbox', { name: 'Passage', exact: true })
  for (let edit = 1; edit <= 17; edit++) {
    await passage.fill(`Typing pause ${edit}`)
    await expect.poll(() => backend.tree().nodes[0].text).toBe(`<p>Typing pause ${edit}</p>`)
  }
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(passage).toHaveText('Start passage')
  await expect(ending).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(ending).toHaveCount(1)
  await expect.poll(() => backend.tree().nodes[0].join).toEqual([{ node: 'node_1' }])
})
