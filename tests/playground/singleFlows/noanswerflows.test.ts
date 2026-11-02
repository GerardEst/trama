import { test, expect } from '@playwright/test'
import { entryAt, openMockStory } from '../mock-story'

const story = {
  id: 'no-answer-flow', name: 'noanswerflows.test',
  tree: { refs: {}, categories: [], entryPoint: entryAt(), nodes: [
    { id: 'node_0', type: 'content', top: 0, left: 0, text: '<p>node 1</p>', join: [{ node: 'node_1' }] },
    { id: 'node_1', type: 'content', top: 0, left: 0, text: '<p>node 2</p>', join: [{ node: 'node_2' }] },
    { id: 'node_2', type: 'end', top: 0, left: 0, text: '<p>end node</p>' },
  ] },
}

test.describe('Flow of no-answers nodes', () => {
  test('can start and see all the steps till the end without interaction', async ({ page }) => {
    await openMockStory(page, story)
    await expect(page).toHaveTitle(/noanswerflows\.test$/)

    const title = page.getByRole('heading', { name: /noanswerflows\.test/ })
    await expect(title).toBeVisible()
    await expect(page).toHaveTitle(await title.innerText())

    // Automatic joins chain into one step, shown together even in single mode.
    await expect(page.getByText('node 1')).toBeVisible()
    await expect(page.getByText('node 2')).toBeVisible()
    await expect(page.getByText('end node')).toBeVisible()
  })
})
