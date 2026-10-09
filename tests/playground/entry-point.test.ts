import { expect, test } from '@playwright/test'

for (const cumulativeMode of [false, true]) {
  test(`starts at the configured scene inside a group in ${cumulativeMode ? 'cumulative' : 'single'} mode`, async ({ page }) => {
    const story = {
      id: 'entry-point', name: 'Entry point regression', cumulativeMode,
      tracking: false, sharing: false, tapLink: false, footer: {},
      tree: {
        refs: {}, categories: [],
        entryPoint: { left: 0, top: 0, targetNodeId: 'node_1' },
        nodes: [
          { id: 'node_0', type: 'content', left: 0, top: 0, text: 'This is not the opening' },
          { id: 'node_1', type: 'content', left: 300, top: 0, groupId: 'node_3', text: 'The chosen opening',
            answers: [{ id: 'answer_1_0', text: 'Finish this adventure', join: [{ node: 'node_2' }] }] },
          { id: 'node_2', type: 'end', left: 600, top: 0, text: 'The chosen ending' },
          { id: 'node_3', type: 'group', left: 300, top: 0 },
        ],
      },
    }
    await page.route('**/rest/v1/stories?*', route => route.fulfill({ json: [story] }))
    await page.goto(`/private/${story.id}`)
    await expect(page.getByText('The chosen opening', { exact: true })).toBeVisible()
    await expect(page.getByText('This is not the opening', { exact: true })).toHaveCount(0)
    await expect(page.locator('polo-entry-point')).toHaveCount(0)
    await page.getByRole('button', { name: 'Finish this adventure', exact: true }).click()
    await expect(page.getByText('The chosen ending', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText('The chosen opening', { exact: true })).toBeVisible()
  })
}

test('an explicitly disconnected start does not execute node_0', async ({ page }) => {
  const story = {
    id: 'disconnected-entry', name: 'Disconnected entry regression', cumulativeMode: false,
    tracking: false, sharing: false, tapLink: false, footer: {},
    tree: {
      refs: {}, categories: [], entryPoint: { left: 0, top: 0 },
      nodes: [{ id: 'node_0', type: 'content', left: 0, top: 0, text: 'Do not start here' }],
    },
  }
  await page.route('**/rest/v1/stories?*', route => route.fulfill({ json: [story] }))
  await page.goto(`/private/${story.id}`)
  await expect(page.getByRole('status')).toHaveText('This story has no connected starting point.')
  await expect(page.getByText('Do not start here', { exact: true })).toHaveCount(0)
})
