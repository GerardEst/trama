import { test, expect } from '@playwright/test'

for (const cumulativeMode of [false, true]) {
  test(`Unavailable answers support story defaults and exceptions (${cumulativeMode ? 'cumulative' : 'single'})`, async ({ page }) => {
    const requirement = { target: 'condition_key', type: 'condition', amount: 1 }
    const story = {
      id: 'locked-answers', name: 'Locked answers',
      tracking: false, sharing: false, tapLink: false, footer: {}, cumulativeMode,
      tree: {
        unavailableAnswerDisplay: 'requirements', categories: [],
        refs: { condition_key: { type: 'condition', name: 'Bronze key' } },
        nodes: [
          { id: 'node_0', type: 'content', left: 0, top: 0, text: 'At the door', answers: [
            { id: 'inherited', text: 'Enter the door', requirements: [requirement], join: [{ node: 'node_2' }] },
            { id: 'locked', text: 'Open the chest', unavailableAnswerDisplay: 'locked', requirements: [requirement], join: [{ node: 'node_2' }] },
            { id: 'hidden', text: 'Secret tunnel', unavailableAnswerDisplay: 'hidden', requirements: [requirement], join: [{ node: 'node_2' }] },
            { id: 'key', text: 'Pick up the key', events: [{ id: 'getKey', type: 'condition', action: 'alterCondition', target: 'condition_key', amount: '1' }], join: [{ node: 'node_1' }] },
          ] },
          { id: 'node_1', type: 'content', left: 0, top: 0, text: 'You found a key', answers: [
            { id: 'return', text: 'Return to the door', join: [{ node: 'node_0' }] },
          ] },
          { id: 'node_2', type: 'end', left: 0, top: 0, text: 'Inside' },
        ],
      },
    }
    await page.route('**/rest/v1/stories?*', route => route.fulfill({ json: [story] }))
    await page.goto(`/private/${story.id}`)
    const door = page.getByRole('button', { name: /Enter the door/ }).last()
    const chest = page.getByRole('button', { name: /Open the chest/ }).last()
    await expect(door).toBeDisabled()
    await expect(door).toContainText('Requires: Bronze key')
    await expect(chest).toBeDisabled()
    await expect(chest).toContainText('Unavailable')
    await expect(chest).not.toContainText('Bronze key')
    await expect(page.getByRole('button', { name: 'Secret tunnel' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Pick up the key' }).click()
    await page.getByRole('button', { name: 'Return to the door' }).click()
    await expect(door).toBeEnabled()
    await expect(door).not.toContainText('Requires:')
    await expect(chest).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Secret tunnel' })).toBeEnabled()
    await door.click()
    await expect(page.getByText('Inside', { exact: true })).toBeVisible()
  })

  test(`Legacy stories still hide unavailable answers (${cumulativeMode ? 'cumulative' : 'single'})`, async ({ page }) => {
    const story = {
      id: 'legacy-locked', name: 'Legacy', tracking: false, sharing: false, tapLink: false, footer: {}, cumulativeMode,
      tree: { refs: {}, categories: [], nodes: [{
        id: 'node_0', type: 'content', left: 0, top: 0, text: 'A passage', answers: [{
          id: 'a', text: 'Hidden answer', requirements: [{ id: 'condition_key', type: 'condition', amount: 1 }],
          join: [{ node: 'node_0' }],
        }],
      }] },
    }
    await page.route('**/rest/v1/stories?*', route => route.fulfill({ json: [story] }))
    await page.goto(`/private/${story.id}`)
    await expect(page.getByText('A passage', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Hidden answer/ })).toHaveCount(0)
  })
}
