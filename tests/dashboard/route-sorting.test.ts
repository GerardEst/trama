import { test, expect } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

test('distributor routes can be dragged and keyboard-sorted without moving the fallback (mocked backend)', async ({ page }) => {
  const storyId = '00000000-0000-4000-8000-000000000004'
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'route-test@example.com', aud: 'authenticated', role: 'authenticated' }
  let persisted: tree = {
    nodes: [{
      id: 'node_0', type: 'distributor', top: 5000, left: 5000,
      conditions: [
        { id: 'condition_0_0', ref: 'stat_gold', comparator: 'morethan', value: 1, join: [{ node: 'node_1' }] },
        { id: 'condition_0_1', rules: [{ ref: 'stat_gold', comparator: 'morethan', value: 2 }], join: [{ node: 'node_1', toAnswer: true }] },
        { id: 'condition_0_2', ref: 'stat_gold', comparator: 'morethan', value: 3, join: [{ node: 'node_1' }] },
      ],
      fallbackCondition: { id: 'condition_0_fallback', join: [{ node: 'node_1' }] },
    }, { id: 'node_1', type: 'end', text: 'End', top: 5000, left: 5500 }],
    refs: { stat_gold: { name: 'Gold', type: 'stat' } }, categories: [],
  }
  const original = structuredClone(persisted.nodes[0])
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  // Synthetic credentials and intercepted requests only: no real backend writes.
  await page.addInitScript(({ authKey, user, storyId }) => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp, role: 'authenticated' }))}.test-signature`
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'test-refresh-token', token_type: 'bearer', expires_at: exp, expires_in: 3600, user }))
    localStorage.setItem('polo-id', storyId)
  }, { authKey, user, storyId })
  await page.route(`${environment.apiUrl}/**`, async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/auth/v1/user') await route.fulfill({ json: user })
    else if (path === '/rest/v1/profiles') await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Test author' }] })
    else if (path === '/rest/v1/stories' && route.request().method() === 'PATCH') {
      persisted = route.request().postDataJSON().tree
      await route.fulfill({ json: { id: storyId } })
    } else if (path === '/rest/v1/stories') {
      await route.fulfill({ json: [{ id: storyId, name: 'Route sorting regression', tree: persisted, tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
    } else await route.abort()
  })
  await page.setViewportSize({ width: 1600, height: 1400 })
  await page.goto('/dashboard')
  const node = page.locator('.node[data-board-join-node="node_0"]')
  const routes = node.locator('polo-condition[data-sortable-id]')
  const fallback = node.locator('polo-condition').filter({ hasText: 'Otherwise' })
  await expect(routes).toHaveCount(3)
  await expect(fallback.locator('[data-sortable-handle]')).toHaveCount(0)
  const firstHandle = routes.first().getByRole('button', { name: /Drag to reorder route/ })
  const start = (await firstHandle.boundingBox())!
  const end = (await routes.last().boundingBox())!
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(start.x + start.width / 2, end.y + end.height - 5, { steps: 12 })
  await expect(page.locator('[data-sortable-preview]')).toContainText('Route 1')
  await expect(page.locator('[data-sortable-indicator]')).toBeVisible()
  await page.mouse.up()
  await expect(routes.first()).toHaveAttribute('data-sortable-id', 'condition_0_1')
  await expect(routes.last()).toHaveAttribute('data-sortable-id', 'condition_0_0')
  await expect(routes.locator('.condition__heading strong')).toHaveText(['Route 1', 'Route 2', 'Route 3'])
  await expect.poll(() => persisted.nodes[0].conditions).toEqual([original.conditions![1], original.conditions![2], original.conditions![0]])
  expect(persisted.nodes[0].fallbackCondition).toEqual(original.fallbackCondition)
  expect(persisted.nodes[0].top).toBe(5000)
  expect(persisted.nodes[0].left).toBe(5000)

  const handle = node.locator('[data-sortable-id="condition_0_0"]').getByRole('button', { name: /Drag to reorder route/ })
  await handle.press('Home')
  await expect(handle).toBeFocused()
  await expect.poll(() => persisted.nodes[0]).toEqual(original)
  await page.reload()
  await expect(routes.first()).toHaveAttribute('data-sortable-id', 'condition_0_0')
  await expect(fallback).toBeVisible()
  await expect(fallback.locator('[data-sortable-handle]')).toHaveCount(0)
})
