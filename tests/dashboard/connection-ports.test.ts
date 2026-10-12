import { test, expect, type Page } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// All credentials and backend responses are synthetic; no real story is touched.
test.use({ storageState: { cookies: [], origins: [] } })

async function openStory(page: Page, theme: 'light' | 'dark' = 'light') {
  const storyId = '00000000-0000-4000-8000-000000000062'
  const user = { id: '00000000-0000-4000-8000-000000000061', email: 'ports-test@example.com', aud: 'authenticated', role: 'authenticated' }
  let savedTree: tree = {
    entryPoint: { left: 4800, top: 4900, targetNodeId: 'node_0' },
    refs: { stat_keys: { type: 'stat', name: 'Keys' } }, categories: [],
    nodes: [
      { id: 'node_0', name: 'Arrival', type: 'content', left: 5000, top: 5000, text: 'You arrive at the old house.' },
      { id: 'node_1', name: 'Choose a path', type: 'content', left: 5400, top: 5000, text: 'Which way will you go?', answers: [
        { id: 'answer_1_0', text: 'Enter the house', join: [{ node: 'node_2' }] },
        { id: 'answer_1_1', text: 'Walk away' },
      ] },
      { id: 'node_2', name: 'Check the key', type: 'distributor', left: 5000, top: 5300, conditions: [
        { id: 'condition_2_0', ref: 'stat_keys', comparator: 'morethan', value: 0, join: [{ node: 'node_3' }] },
      ], fallbackCondition: { id: 'condition_2_fallback' } },
      { id: 'node_3', name: 'Ending', type: 'end', left: 5400, top: 5350, text: 'The journey continues.' },
    ],
  }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  await page.addInitScript(({ authKey, user, storyId, theme }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.invalid-test-signature`
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'ports-test-refresh', token_type: 'bearer', expires_at: expiresAt, expires_in: 3600, user }))
    localStorage.setItem('polo-id', storyId)
    localStorage.setItem('polo-lang', 'en')
    localStorage.setItem('polo-theme', theme)
  }, { authKey, user, storyId, theme })
  await page.route(`${environment.apiUrl}/**`, async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/auth/v1/user') await route.fulfill({ json: user })
    else if (path === '/rest/v1/profiles') await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Test author' }] })
    else if (path === '/rest/v1/stories' && request.method() === 'PATCH') {
      savedTree = request.postDataJSON().tree
      await route.fulfill({ json: { id: storyId } })
    } else if (path === '/rest/v1/stories') await route.fulfill({ json: [{ id: storyId, name: 'Connection tabs', tree: savedTree, tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
    else await route.abort()
  })
  await page.setViewportSize({ width: 1600, height: 1200 })
  await page.goto('/dashboard')
  await expect(page.locator('[data-board-origin]')).toHaveCount(6)
  return () => savedTree
}

for (const theme of ['light', 'dark'] as const) {
  test(`connection tabs stay usable and aligned in ${theme} mode (mocked backend)`, async ({ page }, testInfo) => {
    const savedTree = await openStory(page, theme)
    for (const port of await page.locator('[data-board-origin]').all()) {
      await expect(port).toBeVisible()
      const geometry = await port.evaluate(element => {
        const rect = element.getBoundingClientRect()
        const parent = element.closest('.node, .entryPoint')!
        const parentRect = parent.getBoundingClientRect()
        return {
          width: rect.width, height: rect.height,
          center: rect.left + rect.width / 2,
          edge: parentRect.right - parseFloat(getComputedStyle(parent).borderRightWidth) / 2,
          radius: parseFloat(getComputedStyle(element).borderTopLeftRadius),
          icon: getComputedStyle(element, '::after').getPropertyValue('mask-image'),
        }
      })
      expect(geometry.width).toBeCloseTo(geometry.height, 1)
      expect(Math.abs(geometry.center - geometry.edge)).toBeLessThan(1)
      expect(geometry.radius).toBeGreaterThan(0)
      expect(geometry.radius).toBeLessThan(geometry.width / 2)
      expect(geometry.icon).toContain('arrow-right.svg')
    }
    // The larger port hit area must not steal the answer menu's clicks.
    const answerMenu = page.locator('polo-answer').filter({ hasText: 'Walk away' })
      .getByRole('button', { name: 'Answer options', exact: true })
    await answerMenu.click()
    await expect(page.getByRole('menu', { name: 'Answer options', exact: true })).toBeVisible()
    await page.getByRole('menuitem', { name: 'Delete answer', exact: true }).press('Escape')
    await expect(answerMenu).toBeFocused()

    const source = page.locator('[data-board-origin="node_0"]')
    const initialColor = await source.evaluate(element => getComputedStyle(element).backgroundColor)
    const activeColor = await page.evaluate(() => {
      const sample = document.createElement('span')
      sample.style.backgroundColor = 'var(--polo-color-action-soft)'
      document.body.append(sample)
      const color = getComputedStyle(sample).backgroundColor
      sample.remove()
      return color
    })
    expect(activeColor).not.toBe(initialColor)
    await source.hover()
    await expect.poll(() => source.evaluate(element => getComputedStyle(element).backgroundColor)).toBe(activeColor)
    const from = (await source.boundingBox())!
    const target = page.locator('.node[data-board-join-node="node_1"] .node__header')
    const to = (await target.boundingBox())!
    // Grab just outside the visible tab, proving the expanded hit area works.
    await page.mouse.move(from.x + from.width + 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(to.x + 30, to.y + to.height / 2, { steps: 10 })
    await page.mouse.up()
    await expect.poll(() => savedTree().nodes[0].join).toEqual([{ node: 'node_1', toAnswer: false }])
    await expect(source).toHaveClass(/union_point--hasJoin/)
    await expect.poll(() => source.evaluate(element => getComputedStyle(element).backgroundColor)).toBe(activeColor)
    await page.mouse.move(30, 30)
    await page.screenshot({ path: testInfo.outputPath('connection-ports.png') })
  })
}

test.describe('touch connection tabs', () => {
  test.use({ hasTouch: true })
  test('keeps the visible tab compact but exposes a 44px touch target (mocked backend)', async ({ page }) => {
    await openStory(page)
    const source = page.locator('[data-board-origin="node_0"]')
    const hitArea = await source.evaluate(element => {
      const style = getComputedStyle(element, '::before')
      const rect = element.getBoundingClientRect()
      return {
        coarse: matchMedia('(pointer: coarse)').matches, width: style.width, height: style.height, left: style.left,
        hittable: document.elementFromPoint(rect.left + 43, rect.top + rect.height / 2) === element,
      }
    })
    expect(hitArea).toEqual({ coarse: true, width: '44px', height: '44px', left: '0px', hittable: true })
    expect((await source.boundingBox())!.width).toBeLessThan(44)
  })
})
