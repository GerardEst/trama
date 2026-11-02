import { test, expect } from '@playwright/test'
import { entryAt, openMockStory } from '../mock-story'

const story = {
  id: 'cumulative-edge-case', name: 'cumulativeedgecase_1.test', cumulativeMode: true,
  tree: { refs: {}, categories: [], entryPoint: entryAt(), nodes: [
    { id: 'node_0', type: 'content', top: 0, left: 0, text: '<p>node1</p>', answers: [
      { id: 'answer_0_0', text: '<p>answer1</p>', join: [{ node: 'node_1' }] },
    ] },
    { id: 'node_1', type: 'distributor', top: 0, left: 0, conditions: [],
      fallbackCondition: { id: 'condition_1_fallback', join: [{ node: 'node_2' }] } },
    { id: 'node_2', type: 'content', top: 0, left: 0, text: '<p>node2</p>', answers: [
      { id: 'answer_2_0', text: '<p>again</p>', join: [{ node: 'node_0' }] },
    ] },
  ] },
}

test(
  'nodes are always active nodes after a distributor node in cumulative mode',
  { tag: '@edgecase' },
  async ({ page }) => {
    await openMockStory(page, story)
    await page.getByRole('button', { name: 'answer1' }).click()

    const lastNode = page.locator('.node').filter({ hasText: 'node2' })
    await expect(lastNode).toBeVisible()
    await expect(lastNode).not.toHaveClass(/node--inactive/)
    await expect(page.getByRole('button', { name: 'again' })).toBeEnabled()
    await expect(page.locator('.node').filter({ hasText: 'node1' })).toHaveClass(/node--inactive/)
  }
)
