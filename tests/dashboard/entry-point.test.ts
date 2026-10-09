import { expect, test } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// Synthetic credentials and intercepted requests only; no real project writes.
test.use({ storageState: { cookies: [], origins: [] } })

test('moves and reconnects Start, previews its destination and allows deleting node_0', async ({ page }) => {
  const storyId = '00000000-0000-4000-8000-000000000052'
  const user = { id: '00000000-0000-4000-8000-000000000051', email: 'entry-test@example.com', aud: 'authenticated', role: 'authenticated' }
  let savedTree: tree = {
    refs: {}, categories: [],
    entryPoint: { left: 4800, top: 4900, targetNodeId: 'node_0' },
    nodes: [
      { id: 'node_0', type: 'content', left: 5000, top: 5000, text: 'Original opening' },
      { id: 'node_1', type: 'content', left: 5400, top: 5000, text: 'New opening' },
    ],
  }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  await page.addInitScript(({ authKey, user, storyId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.invalid-test-signature`
    localStorage.setItem(authKey, JSON.stringify({
      access_token: token, refresh_token: 'entry-test-refresh', token_type: 'bearer',
      expires_at: expiresAt, expires_in: 3600, user,
    }))
    localStorage.setItem('polo-id', storyId)
    localStorage.setItem('polo-lang', 'en')
  }, { authKey, user, storyId })
  await page.route(`${environment.apiUrl}/**`, async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/auth/v1/user') await route.fulfill({ json: user })
    else if (path === '/rest/v1/profiles') await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Test author' }] })
    else if (path === '/rest/v1/stories' && request.method() === 'PATCH') {
      savedTree = request.postDataJSON().tree
      await route.fulfill({ json: { id: storyId } })
    } else if (path === '/rest/v1/stories') await route.fulfill({ json: [{
      id: storyId, name: 'Entry regression', tree: savedTree, tracking: false, sharing: false,
      tapLink: false, cumulativeMode: false, footer: {}, custom_id: null,
    }] })
    else await route.abort()
  })
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  const marker = page.locator('polo-entry-point')
  await expect(marker).toHaveCount(1)
  await expect(marker).toBeVisible()
  const handle = marker.locator('.entryPoint__handle')
  const before = await handle.boundingBox()
  await page.mouse.move(before!.x + 30, before!.y + 20)
  await page.mouse.down()
  await page.mouse.move(before!.x + 80, before!.y + 50, { steps: 10 })
  await page.mouse.up()
  await expect.poll(() => savedTree.entryPoint?.left).toBeCloseTo(4850, 0)
  await expect.poll(() => savedTree.entryPoint?.top).toBeCloseTo(4930, 0)
  expect(savedTree.nodes).toHaveLength(2)

  const port = marker.locator('[data-board-origin]')
  const target = page.locator('.node[data-board-join-node="node_1"] .node__header')
  const from = await port.boundingBox()
  const to = await target.boundingBox()
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2)
  await page.mouse.down()
  await page.mouse.move(to!.x + 30, to!.y + 20, { steps: 10 })
  await page.mouse.up()
  await expect.poll(() => savedTree.entryPoint?.targetNodeId).toBe('node_1')
  const oldNode = page.locator('.node[data-board-join-node="node_0"]')
  await oldNode.getByRole('button', { name: 'Node options', exact: true }).click()
  await oldNode.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(oldNode).toHaveCount(0)
  await expect.poll(() => savedTree.nodes.map(node => node.id)).toEqual(['node_1'])
  expect(savedTree.entryPoint?.targetNodeId).toBe('node_1')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  const preview = page.locator('polo-linear-editor')
  await expect(preview.locator('.authorSheet')).toContainText('New opening')
  await expect(preview.locator('.authorSheet')).not.toContainText('Original opening')
  await preview.getByRole('button', { name: 'Close preview', exact: true }).click()
  await page.reload()
  await expect(marker).toHaveCount(1)
  await expect(oldNode).toHaveCount(0)
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(preview.locator('.authorSheet')).toContainText('New opening')
  await preview.getByRole('button', { name: 'Close preview', exact: true }).click()
  const initialNode = page.locator('.node[data-board-join-node="node_1"]')
  await initialNode.getByRole('button', { name: 'Node options', exact: true }).click()
  await initialNode.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(marker.getByRole('status')).toHaveText('Connect Start to a node to play.')
  await expect.poll(() => savedTree.entryPoint?.targetNodeId).toBeUndefined()
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(preview.getByRole('status')).toHaveText('Connect Start to a node to play.')
  await expect(preview.locator('.authorSheet')).toHaveCount(0)
  await preview.getByRole('button', { name: 'Close preview', exact: true }).click()
  await page.reload()
  await expect(marker.getByRole('status')).toHaveText('Connect Start to a node to play.')
  // A blank story can create its first scene directly from the entry connector.
  const emptyFrom = await port.boundingBox()
  await page.mouse.move(emptyFrom!.x + emptyFrom!.width / 2, emptyFrom!.y + emptyFrom!.height / 2)
  await page.mouse.down()
  await page.mouse.move(emptyFrom!.x + 300, emptyFrom!.y + 180, { steps: 10 })
  await page.mouse.up()
  await expect.poll(() => savedTree.entryPoint?.targetNodeId).toBe('node_0')
  await expect.poll(() => savedTree.nodes.map(node => node.id)).toEqual(['node_0'])
  await expect(marker.getByRole('status')).toHaveCount(0)
})
