import { test, expect } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

test('failed batch deletions survive reload and are saved after retry (mocked backend)', async ({ page }) => {
  const authorId = '00000000-0000-4000-8000-000000000001'
  const storyId = '00000000-0000-4000-8000-000000000002'
  const user = { id: authorId, email: 'save-test@example.com', aud: 'authenticated', role: 'authenticated' }
  let rejectSaves = true
  let failedWrites = 0
  let persistedTree: tree = {
    nodes: [
      { id: 'node_0', type: 'content', text: 'Start', top: 5000, left: 5000 },
      { id: 'node_1', type: 'content', text: 'Delete me first', top: 5000, left: 5340 },
      { id: 'node_2', type: 'content', text: 'Delete me next', top: 5000, left: 4660 },
    ],
    refs: {}, categories: [],
  }

  // Synthetic, invalid credentials are used only against intercepted requests.
  // This test never signs in to or modifies the real Supabase project.
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  await page.addInitScript(({ authKey, user, storyId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.test-signature`
    localStorage.setItem(authKey, JSON.stringify({
      access_token: token, refresh_token: 'test-refresh-token', token_type: 'bearer',
      expires_at: expiresAt, expires_in: 3600, user,
    }))
    localStorage.setItem('polo-id', storyId)
  }, { authKey, user, storyId })

  await page.route(`${environment.apiUrl}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/auth/v1/user') {
      await route.fulfill({ json: user })
    } else if (path === '/rest/v1/profiles') {
      await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Test author', next_payment: '2030-01-01' }] })
    } else if (path === '/rest/v1/stories' && route.request().method() === 'PATCH') {
      if (rejectSaves) {
        failedWrites++
        await route.fulfill({ status: 403, json: { code: '42501', message: 'Simulated save failure' } })
      } else {
        persistedTree = route.request().postDataJSON().tree
        await route.fulfill({ json: { id: storyId } })
      }
    } else if (path === '/rest/v1/stories') {
      await route.fulfill({ json: [{
        id: storyId, name: 'Save regression', tree: persistedTree,
        tracking: false, sharing: false, tapLink: false, cumulativeMode: false,
        footer: {}, custom_id: null,
      }] })
    } else {
      await route.abort()
    }
  })

  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  for (const id of ['node_1', 'node_2']) {
    const node = page.locator(`.node[data-board-join-node="${id}"]`)
    await node.getByRole('button', { name: 'Node options', exact: true }).click()
    await node.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(node).toHaveCount(0)
  }
  const status = page.getByRole('status')
  await expect(status).toContainText('Board changes not saved')
  expect(failedWrites).toBeGreaterThan(0)
  expect(persistedTree.nodes).toHaveLength(3)

  page.once('dialog', (dialog) => dialog.accept())
  await page.reload()
  await expect(status).toContainText('Unsaved edits recovered from this tab')
  await expect(page.locator('.node[data-board-join-node="node_1"]')).toHaveCount(0)
  await expect(page.locator('.node[data-board-join-node="node_2"]')).toHaveCount(0)

  rejectSaves = false
  await page.getByRole('button', { name: 'Retry save', exact: true }).click()
  await expect(status).toContainText('Board changes saved')
  expect(persistedTree.nodes.map((node) => node.id)).toEqual(['node_0'])
  await page.reload()
  await expect(page.locator('.node[data-board-join-node="node_0"]')).toHaveCount(1)
  await expect(page.locator('.node[data-board-join-node="node_1"]')).toHaveCount(0)
  await expect(page.locator('.node[data-board-join-node="node_2"]')).toHaveCount(0)
})
