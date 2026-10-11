import { test, expect } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// Collision handling uses CSS anchors, unsupported by the shared project's WebKit.
test.use({ browserName: 'chromium' })

// Synthetic session and backend: placement checks never write to a real story.
test.beforeEach(async ({ page }) => {
  const storyId = '00000000-0000-4000-8000-000000000010'
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'editor-placement@example.com', aud: 'authenticated', role: 'authenticated' }
  const story: tree = {
    nodes: [{ id: 'node_0', type: 'content', text: 'Choose a path', top: 5000, left: 5000, answers: [
      { id: 'answer_0_0', text: 'Enter the door', join: [{ node: 'node_1' }] },
      { id: 'answer_0_1', text: 'Leave', join: [{ node: 'node_1' }] },
    ] }, { id: 'node_1', type: 'end', text: 'End', top: 5000, left: 5500 }],
    refs: { stat_gold: { type: 'stat', name: 'Gold' } }, categories: [],
  }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
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
    else if (path === '/rest/v1/stories' && route.request().method() === 'GET') {
      await route.fulfill({ json: [{ id: storyId, name: 'Editor placement', tree: story, tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
    } else await route.abort()
  })
  await page.setViewportSize({ width: 1600, height: 1100 })
  await page.goto('/dashboard')
})

for (const placement of ['right', 'bottom', 'bottom-right']) {
  for (const editor of ['answer-event', 'answer-requirement', 'node-event']) {
    test(`${editor} fits near the ${placement} viewport edge (mocked backend)`, async ({ page }) => {
      const node = page.locator('.node[data-board-join-node="node_0"]')
      await expect(node).toBeVisible()
      // Move the real node without persisting coordinates or depending on board pan.
      // Account for board zoom so the trigger actually reaches the viewport edge.
      await node.evaluate((element: HTMLElement, placement) => {
        const rect = element.getBoundingClientRect()
        const x = placement === 'bottom'
          ? (window.innerWidth - rect.width) / 2
          : window.innerWidth - rect.width - 32
        const y = placement === 'right' ? 200 : window.innerHeight - rect.height - 32
        const scale = rect.width / element.offsetWidth
        element.style.translate = `${(x - rect.x) / scale}px ${(y - rect.y) / scale}px`
      }, placement)
      if (editor === 'node-event') {
        await node.locator('.node__menuButton button').click()
        await node.locator('.node__options').getByRole('button', { name: 'Add event', exact: true }).click()
      } else {
        await node.locator('polo-answer').filter({ hasText: 'Enter the door' })
          .getByRole('button', { name: 'Answer options', exact: true }).click()
        await page.getByRole('menuitem', { name: editor === 'answer-requirement' ? 'Add requirement…' : 'Add event…' }).click()
      }
      const dialog = page.getByRole('dialog', { name: editor === 'answer-requirement' ? 'Add requirement' : 'Add event', exact: true })
      await expect(dialog).toBeVisible()
      const nodeBounds = (await node.boundingBox())!
      const viewport = page.viewportSize()!
      if (placement !== 'bottom') expect(nodeBounds.x + nodeBounds.width).toBeCloseTo(viewport.width - 32, 1)
      if (placement !== 'right') expect(nodeBounds.y + nodeBounds.height).toBeCloseTo(viewport.height - 32, 1)
      const expectAnchoredLayout = async () => {
        await expect.poll(() => dialog.evaluate(element => {
          const rect = element.getBoundingClientRect()
          const panel = element.closest('.anchoredPopover__panel')!.getBoundingClientRect()
          // The popover uses a 1rem viewport gap; allow 1px layout rounding.
          const margin = parseFloat(getComputedStyle(document.documentElement).fontSize) - 1
          return {
            panelHasHeight: panel.height > 0,
            containsDialog: panel.top <= rect.top + 1 && panel.bottom >= rect.bottom - 1
              && panel.left <= rect.left + 1 && panel.right >= rect.right - 1,
            overflowX: Math.max(margin - rect.left, rect.right - window.innerWidth + margin, 0),
            overflowY: Math.max(margin - rect.top, rect.bottom - window.innerHeight + margin, 0),
          }
        })).toEqual({ panelHasHeight: true, containsDialog: true, overflowX: 0, overflowY: 0 })
      }
      await expectAnchoredLayout()
      // Choosing a reference grows the form: collision handling must reflow it too.
      await dialog.locator('polo-selector button.selector').click()
      await dialog.getByRole('option', { name: 'Gold', exact: true }).click()
      await expect(dialog.getByRole('spinbutton')).toBeVisible()
      await expectAnchoredLayout()
      await expect(dialog.getByRole('button', { name: editor === 'answer-requirement' ? 'Add requirement' : 'Add event', exact: true }))
        .toBeInViewport({ ratio: 1 })
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
      await expect(dialog).toHaveCount(0)
    })
  }
}
