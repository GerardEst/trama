import { test, expect } from '@playwright/test'
import { entryAt, openMockStory, token } from '../mock-story'

const story = {
  id: 'user-text-flow', name: 'usertextflow.test',
  tree: { refs: {}, categories: [], entryPoint: entryAt(), nodes: [
    { id: 'node_0', type: 'text', top: 0, left: 0, text: '<p>node 1</p>',
      userTextOptions: { property: 'name' }, join: [{ node: 'node_1' }] },
    { id: 'node_1', type: 'text', top: 0, left: 0, text: `<p>node 2</p><p>Hello ${token('property', 'name')}</p>`,
      userTextOptions: { property: 'prop' }, join: [{ node: 'node_2' }] },
    { id: 'node_2', type: 'end', top: 0, left: 0, text: `<p>New prop ${token('property', 'prop')}</p>` },
  ] },
}

test.describe('Flow of story with user text inputs', () => {
  test.beforeEach(async ({ page }) => {
    await openMockStory(page, story)
  })

  test('waits for the input before continuing', async ({ page }) => {
    await expect(page.getByText('node 1')).toBeVisible()
    await expect(page.getByRole('textbox')).toBeVisible()
    await expect(page.getByText('node 2')).toHaveCount(0)
  })

  test('entire flow with inputs from user', { tag: '@interpolations' }, async ({ page }) => {
    await page.getByRole('textbox').fill('User')
    await page.getByRole('button', { name: /continue/i }).click()
    await expect(page.getByText('Hello User')).toBeVisible()

    await page.getByRole('textbox').fill('Prop')
    await page.getByRole('button', { name: /continue/i }).click()
    await expect(page.getByText('New prop Prop')).toBeVisible()
  })
})
