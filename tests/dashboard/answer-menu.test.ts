import { test, expect } from '@playwright/test'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// The complete backend and session are synthetic: this never writes a real story.
test('answer menu adds logic, keeps pills editable and persists display settings (mocked backend)', async ({ page }) => {
  const authorId = '00000000-0000-4000-8000-000000000001'
  const storyId = '00000000-0000-4000-8000-000000000009'
  const user = { id: authorId, email: 'answer-menu@example.com', aud: 'authenticated', role: 'authenticated' }
  let persisted: tree = {
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
    else if (path === '/rest/v1/stories' && route.request().method() === 'PATCH') {
      persisted = route.request().postDataJSON().tree
      await route.fulfill({ json: { id: storyId } })
    } else if (path === '/rest/v1/stories') {
      await route.fulfill({ json: [{ id: storyId, name: 'Answer menu', tree: persisted, tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
    } else await route.abort()
  })
  await page.setViewportSize({ width: 1600, height: 1100 })
  await page.goto('/dashboard')
  const answer = page.locator('polo-answer').filter({ hasText: 'Enter the door' })
  const trigger = answer.getByRole('button', { name: 'Answer options', exact: true })
  await expect(trigger).toBeVisible()
  await expect(answer.getByRole('button', { name: 'Add requirement', exact: true })).toHaveCount(0)
  await expect(answer.getByRole('button', { name: 'Add event', exact: true })).toHaveCount(0)
  await expect(answer.getByRole('combobox')).toHaveCount(0)
  await expect(answer.locator('.richTextField__button')).toHaveCount(0)
  const node = page.locator('.node[data-board-join-node="node_0"]')
  const nodeBounds = (await node.boundingBox())!
  const portBounds = (await answer.locator('.union_point').boundingBox())!
  expect(portBounds.width).toBeCloseTo(portBounds.height, 1)
  expect(Math.abs(portBounds.x + portBounds.width / 2 - nodeBounds.x - nodeBounds.width)).toBeLessThan(1)
  const nodeText = node.locator('.node__body > polo-rich-text-field')
  const textBounds = (await nodeText.boundingBox())!
  const focusButtonBounds = (await nodeText.locator('.richTextField__button').boundingBox())!
  expect(focusButtonBounds.y).toBeCloseTo(textBounds.y, 1)
  expect(focusButtonBounds.x + focusButtonBounds.width).toBeCloseTo(textBounds.x + textBounds.width, 1)
  await trigger.click()
  const focusAction = page.getByRole('menuitem', { name: 'Focus on Answer text' })
  await expect(focusAction.locator('img')).toHaveAttribute('src', '/assets/icons/maximize.svg')
  await focusAction.click()
  const focusEditor = page.getByRole('dialog', { name: 'Focus on Answer text', exact: true })
  await expect(focusEditor).toBeVisible()
  await focusEditor.locator('[contenteditable="true"]').fill('Enter the door carefully')
  await focusEditor.getByRole('button', { name: 'Close focus mode' }).click()
  await expect.poll(() => persisted.nodes[0].answers![0].text ?? '').toContain('Enter the door carefully')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(page.getByRole('menuitem', { name: 'Display…' })).toHaveAttribute('aria-disabled', 'true')
  await page.getByRole('menuitem', { name: 'Add requirement…' }).click()
  let dialog = page.getByRole('dialog', { name: 'Add requirement', exact: true })
  await dialog.locator('polo-selector button.selector').click()
  await dialog.getByRole('option', { name: 'Gold', exact: true }).click()
  await dialog.getByRole('spinbutton', { name: /Minimum value/ }).fill('3')
  await dialog.getByRole('button', { name: 'Add requirement', exact: true }).click()
  await expect.poll(() => persisted.nodes[0].answers![0].requirements).toEqual([{ target: 'stat_gold', type: 'stat', amount: 3 }])
  const requirementPill = answer.getByRole('button', { name: /Edit requirement Gold/ })
  await expect(requirementPill).toBeVisible()
  await requirementPill.click()
  dialog = page.getByRole('dialog', { name: 'Edit requirement', exact: true })
  await dialog.getByRole('spinbutton', { name: /Minimum value/ }).fill('4')
  await dialog.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect.poll(() => persisted.nodes[0].answers![0].requirements![0].amount).toBe(4)
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Add event…' }).click()
  dialog = page.getByRole('dialog', { name: 'Add event', exact: true })
  await dialog.locator('polo-selector button.selector').click()
  await dialog.getByRole('option', { name: 'Gold', exact: true }).click()
  await dialog.getByRole('spinbutton', { name: /Change by/ }).fill('-4')
  await dialog.getByRole('button', { name: 'Add event', exact: true }).click()
  await expect.poll(() => persisted.nodes[0].answers![0].events![0].amount).toBe('-4')
  await expect(answer.getByRole('button', { name: /Edit event Gold/ })).toBeVisible()
  await expect(node.locator(':scope > .node__events polo-contextual-button')).toHaveCount(0)
  await node.locator('.node__menuButton button').click()
  await node.locator('.node__options').getByRole('button', { name: 'Add event', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Add event', exact: true })
  await dialog.locator('polo-selector button.selector').click()
  await dialog.getByRole('option', { name: 'Gold', exact: true }).click()
  await dialog.getByRole('spinbutton', { name: /Change by/ }).fill('1')
  await dialog.getByRole('button', { name: 'Add event', exact: true }).click()
  await expect.poll(() => persisted.nodes[0].events![0].amount).toBe('1')
  await expect(node.locator(':scope > .node__events').getByRole('button', { name: /Edit event Gold/ })).toBeVisible()
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Display…' }).click()
  const display = page.getByRole('dialog', { name: 'Display', exact: true })
  await expect(display.getByRole('combobox')).toBeFocused()
  await display.getByRole('combobox').selectOption('requirements')
  await expect(display).toHaveCount(0)
  await expect.poll(() => persisted.nodes[0].answers![0].unavailableAnswerDisplay).toBe('requirements')
  await page.reload()
  await expect(requirementPill).toBeVisible()
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Display…' }).click()
  await expect(display.getByRole('combobox')).toHaveValue('requirements')
  await display.getByRole('combobox').press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Delete answer' }).click()
  await expect.poll(() => persisted.nodes[0].answers!.map(answer => answer.id)).toEqual(['answer_0_1'])
  await expect(page.locator('polo-answer').filter({ hasText: 'Leave' })).toBeVisible()
})
