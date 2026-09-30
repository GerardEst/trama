import { test, expect, type Page } from '@playwright/test'
import { environment } from '../../src/environments/environment'
import type { tree } from '../../src/app/core/interfaces/interfaces'

const authorId = '00000000-0000-4000-8000-000000000011'
const storyId = '00000000-0000-4000-8000-000000000012'
const user = {
  id: authorId, email: 'refresh-test@example.com', aud: 'authenticated', role: 'authenticated',
  app_metadata: {}, user_metadata: {}, created_at: '2024-01-01T00:00:00Z',
}
const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`

function syntheticSession(generation: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return {
    access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: authorId, exp: expiresAt, role: 'authenticated', generation })}.invalid-test-signature`,
    refresh_token: `test-refresh-${generation}`, token_type: 'bearer',
    expires_at: expiresAt, expires_in: 3600, user,
  }
}

async function openMockedStory(page: Page, refreshWorks: boolean, serverError = false) {
  const initial = syntheticSession('initial')
  const renewed = syntheticSession('renewed')
  const requests = { refreshes: 0, writes: [] as { token: string, tree: tree }[], signOuts: 0 }
  let persistedTree: tree = {
    nodes: [
      { id: 'node_0', type: 'content', text: 'Start', top: 5000, left: 5000 },
      { id: 'node_1', type: 'content', text: 'Delete me', top: 5000, left: 5340 },
      { id: 'node_2', type: 'content', text: 'Delete me after session loss', top: 5000, left: 4660 },
    ], refs: {}, categories: [],
  }

  // Invalid synthetic tokens; every Supabase request is intercepted. No real
  // account, session or production database is accessed by these tests.
  await page.addInitScript(({ authKey, initial, storyId }) => {
    localStorage.setItem(authKey, JSON.stringify(initial))
    localStorage.setItem('polo-id', storyId)
  }, { authKey, initial, storyId })

  await page.route(`${environment.apiUrl}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/auth/v1/user') {
      await route.fulfill({ json: user })
    } else if (url.pathname === '/auth/v1/token') {
      requests.refreshes++
      expect(url.searchParams.get('grant_type')).toBe('refresh_token')
      expect(request.postDataJSON().refresh_token).toBe(initial.refresh_token)
      if (serverError && requests.refreshes === 1) {
        await route.fulfill({ status: 500, json: { code: 'unexpected_failure', message: 'missing destination name oauth_client_id in *models.Session' } })
      } else if (refreshWorks) {
        await route.fulfill({ json: renewed })
      } else {
        await route.fulfill({ status: 400, json: { code: 'refresh_token_not_found', error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' } })
      }
    } else if (url.pathname === '/auth/v1/logout') {
      requests.signOuts++
      await route.fulfill({ status: 204 })
    } else if (url.pathname === '/rest/v1/profiles') {
      await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Refresh author', next_payment: '2030-01-01' }] })
    } else if (url.pathname === '/rest/v1/stories' && request.method() === 'PATCH') {
      const token = request.headers()['authorization']
      const sentTree: tree = request.postDataJSON().tree
      requests.writes.push({ token, tree: sentTree })
      if (token === `Bearer ${initial.access_token}`) {
        await route.fulfill({ status: 401, json: { code: 'PGRST301', message: 'JWT expired' } })
      } else {
        expect(token).toBe(`Bearer ${renewed.access_token}`)
        persistedTree = sentTree
        await route.fulfill({ json: { id: storyId } })
      }
    } else if (url.pathname === '/rest/v1/stories') {
      await route.fulfill({ json: [{
        id: storyId, name: 'Session regression', tree: persistedTree,
        tracking: false, sharing: false, tapLink: false, cumulativeMode: false,
        footer: {}, custom_id: null,
      }] })
    } else {
      await route.abort()
    }
  })

  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  return { requests, initial, renewed, persisted: () => persistedTree }
}

async function deleteNode(page: Page, nodeId: string) {
  const node = page.locator(`.node[data-board-join-node="${nodeId}"]`)
  await node.getByRole('button', { name: 'Node options', exact: true }).click()
  await node.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(node).toHaveCount(0)
}

test('a rejected JWT is refreshed and the deletion saves without logging out (mocked backend)', async ({ page }) => {
  const { requests, renewed, persisted } = await openMockedStory(page, true)
  await deleteNode(page, 'node_1')
  await expect(page.getByRole('status')).toContainText('Board changes saved')
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(requests.refreshes).toBe(1)
  expect(requests.signOuts).toBe(0)
  expect(requests.writes).toHaveLength(2)
  expect(requests.writes[0].tree).toEqual(requests.writes[1].tree)
  expect(persisted().nodes.map((node) => node.id)).toEqual(['node_0', 'node_2'])
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).access_token, authKey)).toBe(renewed.access_token)
})

test('an Auth HTTP 500 preserves the refresh token and edits until the server recovers (mocked backend)', async ({ page }) => {
  const { requests, initial, persisted } = await openMockedStory(page, true, true)
  await deleteNode(page, 'node_1')
  await expect(page.getByRole('status')).toContainText('Board changes not saved')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).refresh_token, authKey)).toBe(initial.refresh_token)
  expect(requests.signOuts).toBe(0)

  await page.getByRole('button', { name: 'Retry save', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Board changes saved')
  expect(persisted().nodes.map((node) => node.id)).toEqual(['node_0', 'node_2'])
  expect(requests.refreshes).toBe(2)
  expect(requests.signOuts).toBe(0)
})

test('an invalid refresh token pauses writes but keeps subsequent deletions in the author draft (mocked backend)', async ({ page }) => {
  const { requests, persisted } = await openMockedStory(page, false)
  await deleteNode(page, 'node_1')
  await expect(page.getByRole('alert')).toContainText('Your session has ended')
  await expect(page.getByRole('status')).toContainText('Board changes not saved')
  await expect(page).toHaveURL(/\/dashboard$/)
  await deleteNode(page, 'node_2')
  await page.getByRole('button', { name: 'Retry save', exact: true }).click()

  const draft = await page.evaluate((key) => JSON.parse(sessionStorage.getItem(key)!), `polo-pending-tree:${authorId}:${storyId}`)
  expect(draft.nodes.map((node: { id: string }) => node.id)).toEqual(['node_0'])
  expect(persisted().nodes).toHaveLength(3)
  expect(requests.writes).toHaveLength(1)
  expect(requests.refreshes).toBe(1)
  expect(requests.signOuts).toBe(0)
  await expect(page.getByRole('alert').getByRole('button', { name: 'Export JSON', exact: true })).toBeEnabled()
})
