import { test, expect } from '@playwright/test'

// Minimal reproduction of the exported story: two random destinations, one
// joined at its passage and the other at its answers. Legacy nodes omit type.
for (const cumulativeMode of [false, true]) {
  test.describe(`Disconnected answers (${cumulativeMode ? 'cumulative' : 'single'} mode)`, () => {
    const story = {
      id: 'disconnected-answers', name: 'Disconnected answers',
      tracking: false, sharing: false, tapLink: false, footer: {}, cumulativeMode,
      tree: {
        refs: {}, categories: [],
        nodes: [
          {
            id: 'node_0', top: 0, left: 0, text: 'Start here',
            answers: [
              {
                id: 'answer_0_1', text: 'Choose a branch',
                join: [{ node: 'node_1', toAnswer: false }, { node: 'node_2', toAnswer: true }],
              },
              { id: 'answer_0_2', text: '' },
            ],
          },
          {
            id: 'node_1', type: 'content', top: 0, left: 0,
            text: 'Keep going!', answers: [{ id: 'answer_1_0', text: '<p>ccc</p>' }],
          },
          {
            id: 'node_2', top: 0, left: 0,
            text: 'Other passage', answers: [{ id: 'answer_2_1', text: 'Other answer' }],
          },
        ],
      },
    }

    test.beforeEach(async ({ page }) => {
      // No production story or authenticated state is needed for this test.
      await page.route('**/rest/v1/stories?*', (route) => route.fulfill({ json: [story] }))
    })

    test('shows the Keep going answer disabled instead of dropping it', async ({ page }) => {
      await page.addInitScript(() => { Math.random = () => 0.25 })
      await page.goto(`/private/${story.id}`)
      const firstAnswer = page.getByRole('button', { name: 'Choose a branch' })
      await expect(firstAnswer).toBeEnabled()
      await expect(page.locator('polo-game-answer button')).toHaveCount(1)
      await firstAnswer.click()

      await expect(page.getByText('Keep going!', { exact: true })).toBeVisible()
      const unfinishedAnswer = page.getByRole('button', { name: 'ccc', exact: true })
      await expect(unfinishedAnswer).toBeVisible()
      await expect(unfinishedAnswer).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Other answer', exact: true })).toHaveCount(0)
    })

    test('renders the other branch when its join skips the passage', async ({ page }) => {
      await page.addInitScript(() => { Math.random = () => 0.75 })
      await page.goto(`/private/${story.id}`)
      await page.getByRole('button', { name: 'Choose a branch' }).click()

      const unfinishedAnswer = page.getByRole('button', { name: 'Other answer', exact: true })
      await expect(unfinishedAnswer).toBeVisible()
      await expect(unfinishedAnswer).toBeDisabled()
      await expect(page.getByText('Other passage', { exact: true })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'ccc', exact: true })).toHaveCount(0)
    })

    test('falls back to the passage if an answers-only join has no visible answers', async ({ page }) => {
      const emptyStory = structuredClone(story)
      emptyStory.tree.nodes[2].answers = [{ id: 'answer_2_1', text: '<p><br></p>' }]
      await page.route('**/rest/v1/stories?*', (route) => route.fulfill({ json: [emptyStory] }))
      await page.addInitScript(() => { Math.random = () => 0.75 })
      await page.goto(`/private/${story.id}`)
      await page.getByRole('button', { name: 'Choose a branch' }).click()

      await expect(page.getByText('Other passage', { exact: true })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Other answer', exact: true })).toHaveCount(0)
    })
  })
}
