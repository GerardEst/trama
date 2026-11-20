import { test, expect, Page } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// A phone viewport with touch. Taps go through touch events, like a real phone,
// so the board's pan handler is part of what this covers.
test.use({ viewport: { width: 393, height: 851 }, hasTouch: true })

const authorId = '00000000-0000-4000-8000-000000000001'
const storyId = '00000000-0000-4000-8000-000000000010'

// The complete backend and session are synthetic: this never writes a real story.
async function openPhoneDashboard(page: Page) {
  const user = { id: authorId, email: 'mobile-board@example.com', aud: 'authenticated', role: 'authenticated' }
  let persisted: tree = {
    entryPoint: { left: 4820, top: 4900, targetNodeId: 'node_0' },
    nodes: [
      { id: 'node_0', type: 'content', text: 'Choose a path', top: 5000, left: 5000, answers: [
        { id: 'answer_0_0', text: 'Enter the door', join: [{ node: 'node_1' }] },
      ] },
      { id: 'node_1', type: 'end', text: 'End', top: 5000, left: 5500 },
    ],
    refs: {}, categories: [],
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
    else if (path === '/rest/v1/stories' && route.request().method() === 'PATCH') {
      persisted = route.request().postDataJSON().tree
      await route.fulfill({ json: { id: storyId } })
    } else if (path === '/rest/v1/stories') {
      await route.fulfill({ json: [{ id: storyId, name: 'Mobile board', tree: persisted, tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
    } else await route.abort()
  })
  await page.goto('/board')
  await expect(page.locator('polo-node').first()).toBeVisible()
}

/** Taps the dimmed area of an open modal, away from its centered content. */
const tapBackdrop = (page: Page) => page.touchscreen.tap(8, 8)

test('phone workspace collapses the menus and opens them full size (mocked backend)', async ({ page }) => {
  await openPhoneDashboard(page)

  // The story stays named in the header; switching opens a list that fits the phone.
  await expect(page.getByRole('textbox', { name: 'Story name' })).toBeInViewport()
  await page.getByRole('button', { name: 'Switch project' }).tap()
  const switcher = page.locator('.switcherMenu')
  await expect(switcher.getByRole('link', { name: 'Mobile board' })).toHaveAttribute('aria-current', 'page')
  const switcherBox = (await switcher.boundingBox())!
  expect(switcherBox.x).toBeGreaterThanOrEqual(0)
  expect(switcherBox.x + switcherBox.width).toBeLessThanOrEqual(393)
  await page.touchscreen.tap(200, 700)
  await expect(switcher).toBeHidden()

  // The project panel opens full width from the bar along the foot.
  const toggle = page.getByRole('button', { name: 'Project panel', exact: true })
  await toggle.tap()
  const panel = page.locator('#story-panel')
  await expect(panel).toBeVisible()
  await expect.poll(async () => Math.round((await panel.boundingBox())!.x)).toBe(0)
  expect(Math.round((await panel.boundingBox())!.width)).toBe(393)
  await toggle.tap()
  await expect(panel).toBeHidden()

  // The board's controls are one bar along the foot; trying and sharing are icons at the top,
  // and the rest of the story's actions fold into one menu.
  const bar = (await page.locator('polo-board-controls .controls--start').boundingBox())!
  expect(bar.x).toBe(0)
  expect(bar.width).toBe(393)
  expect(Math.round(bar.y + bar.height)).toBe(851)
  const actions = (await page.locator('polo-board-actions .actions').boundingBox())!
  expect(actions.x + actions.width).toBeLessThanOrEqual(393)
  await page.getByRole('button', { name: 'More actions', exact: true }).tap()
  await page.getByRole('button', { name: 'Story options', exact: true }).tap()
  await expect(page.getByRole('dialog', { name: 'Story options' }).getByText('Enable tracking')).toBeVisible()
})

test('phone authors create nodes from the bar along the foot (mocked backend)', async ({ page }) => {
  await openPhoneDashboard(page)
  const nodes = page.locator('polo-node')
  await expect(nodes).toHaveCount(2)
  await page.getByRole('button', { name: 'Add a node', exact: true }).tap()
  const menu = page.getByRole('group', { name: 'Create new node' })
  await expect(menu).toBeVisible()
  await menu.locator('[data-node-type="end"] .contextMenu__create').tap()
  await expect(nodes).toHaveCount(3)
})

test('phone board menus open on tap as centered modals and close from the backdrop (mocked backend)', async ({ page }) => {
  await openPhoneDashboard(page)
  const node = page.locator('polo-node').filter({ hasText: 'Choose a path' })

  await node.getByRole('button', { name: 'Node options' }).tap()
  const duplicate = page.getByRole('button', { name: 'Duplicate' })
  await expect(duplicate).toBeVisible()
  const menu = (await page.locator('.node__options').boundingBox())!
  expect(Math.abs(menu.x + menu.width / 2 - 393 / 2)).toBeLessThan(2)
  await tapBackdrop(page)
  await expect(duplicate).toBeHidden()

  await node.getByRole('button', { name: 'Node options' }).tap()
  await page.getByRole('button', { name: 'Add event' }).tap()
  await expect(page.getByRole('dialog', { name: 'Add event' })).toBeVisible()
  await tapBackdrop(page)
  await expect(page.getByRole('dialog', { name: 'Add event' })).toBeHidden()

  await node.locator('.node__body > polo-rich-text-field .richTextField__button button').tap()
  const focusEditor = page.getByRole('dialog', { name: 'Focus on Node text', exact: true })
  await expect(focusEditor).toBeVisible()
  await focusEditor.getByRole('button', { name: 'Close focus mode' }).tap()
  await expect(focusEditor).toBeHidden()

  await node.getByRole('button', { name: 'Answer options' }).tap()
  const focusAnswer = page.getByRole('menuitem', { name: 'Focus on Answer text' })
  await expect(focusAnswer).toBeVisible()
  await tapBackdrop(page)
  await expect(focusAnswer).toBeHidden()

  // Editing in place needs the tap to reach the field as focus.
  await node.getByRole('textbox', { name: 'Node text' }).tap()
  await expect(node.locator('.node__body > polo-rich-text-field [contenteditable="true"]')).toBeFocused()
})
