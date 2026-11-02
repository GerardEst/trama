import { test, expect } from '@playwright/test'
import { entryAt, openMockStory } from '../mock-story'

const story = {
  id: 'basic-flow', name: 'basicflow.test', sharing: true,
  tree: { refs: {}, categories: [], entryPoint: entryAt(), nodes: [
    { id: 'node_0', type: 'content', top: 0, left: 0, text: '<p>node 1</p>', answers: [
      { id: 'answer_0_0', text: '<p>answer 1</p>', join: [{ node: 'node_1' }] },
      { id: 'answer_0_1', text: '<p>answer 2</p>' },
    ] },
    { id: 'node_1', type: 'content', top: 0, left: 0, text: '<p>node 2</p>', answers: [
      { id: 'answer_1_0', text: '<p>node2 answer</p>', join: [{ node: 'node_2' }] },
    ] },
    { id: 'node_2', type: 'end', top: 0, left: 0, text: '<p>end node</p>' },
  ] },
}

test.describe('Basic flow', () => {
  test.beforeEach(async ({ page }) => {
    await openMockStory(page, story)
  })

  test('can see the first question', async ({ page }) => {
    // Title is on the tab
    await expect(page).toHaveTitle(/basicflow\.test$/)

    // The tab title and the visible story heading stay in sync.
    const title = page.getByRole('heading', { name: /basicflow\.test/ })
    await expect(title).toBeVisible()
    await expect(page).toHaveTitle(await title.innerText())

    // Authored answers remain visible, but only connected answers are playable.
    await expect(page.getByText('node 1')).toBeVisible()
    await expect(page.getByRole('button', { name: 'answer 1' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'answer 2' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'answer 2' })).toBeDisabled()
  })

  test('can complete the test till the end', async ({ page }) => {
    await page.getByRole('button', { name: 'answer 1' }).click()

    // We see the text and answers of the second step
    await expect(page.getByText('node 2')).toBeVisible()
    await page.getByRole('button', { name: 'node2 answer' }).click()

    // Can see text for final node and the share action
    await expect(page.getByText('end node')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Share this story' })).toBeVisible()
  })
})
