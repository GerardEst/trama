import { test, expect } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

test('answer dragging and keyboard sorting persist without moving the node (mocked backend)', async ({ page }) => {
  const authorId = '00000000-0000-4000-8000-000000000001'
  const storyId = '00000000-0000-4000-8000-000000000003'
  const user = { id: authorId, email: 'sort-test@example.com', aud: 'authenticated', role: 'authenticated' }
  let persisted: tree = {
    nodes: [{
      id: 'node_0', type: 'content', text: 'Choose', top: 5000, left: 5000,
      answers: [
        { id: 'answer_0_0', text: 'First', join: [{ node: 'node_1' }] },
        { id: 'answer_0_1', text: 'Second', join: [{ node: 'node_1' }] },
        { id: 'answer_0_2', text: 'Third', join: [{ node: 'node_1' }] },
      ],
    }, { id: 'node_1', type: 'end', text: 'End', top: 5000, left: 5500 }],
    refs: {}, categories: [],
  }
  const originals = structuredClone(persisted.nodes[0].answers!)
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  // Invalid synthetic credentials; every backend request is intercepted.
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
      await route.fulfill({ json: [{ id: storyId, name: 'Sorting regression', tree: persisted, tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
    } else await route.abort()
  })
  await page.setViewportSize({ width: 1600, height: 1100 })
  await page.goto('/dashboard')
  const node = page.locator('.node[data-board-join-node="node_0"]')
  const answers = node.locator('polo-answer')
  await expect(answers).toHaveCount(3)
  const firstHandle = answers.first().getByRole('button', { name: /Drag to reorder/ })
  await firstHandle.scrollIntoViewIfNeeded()
  const start = (await firstHandle.boundingBox())!
  const end = (await answers.last().boundingBox())!
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(start.x + start.width / 2, end.y + end.height - 5, { steps: 12 })
  const preview = page.locator('[data-sortable-preview]')
  const indicator = page.locator('[data-sortable-indicator]')
  await expect(preview).toBeVisible()
  await expect(preview).toContainText('First')
  await expect(preview).toHaveAttribute('aria-hidden', 'true')
  await expect(indicator).toBeVisible()
  const previewBounds = (await preview.boundingBox())!
  const indicatorBounds = (await indicator.boundingBox())!
  const sourceBounds = (await answers.first().boundingBox())!
  expect(previewBounds.width).toBeCloseTo(sourceBounds.width, 0)
  expect(previewBounds.y).toBeGreaterThan(sourceBounds.y)
  expect(indicatorBounds.y).toBeGreaterThan(end.y + end.height)
  expect(indicatorBounds.height).toBe(2)
  await expect(node.locator('[data-sortable-drop]')).toHaveCount(0)
  await page.mouse.up()
  await expect(preview).toHaveCount(0)
  await expect(indicator).toHaveCount(0)
  await expect(answers).toHaveText([/Second/, /Third/, /First/])
  await expect.poll(() => persisted.nodes[0].answers).toEqual([originals[1], originals[2], originals[0]])
  expect(persisted.nodes[0].top).toBe(5000)
  expect(persisted.nodes[0].left).toBe(5000)

  const handle = node.locator('[data-sortable-id="answer_0_0"]').getByRole('button', { name: /Drag to reorder/ })
  await handle.focus()
  await handle.press('Home')
  await expect(answers).toHaveText([/First/, /Second/, /Third/])
  await expect(handle).toBeFocused()
  await expect.poll(() => persisted.nodes[0].answers).toEqual(originals)
  await page.reload()
  await expect(answers).toHaveText([/First/, /Second/, /Third/])
})
