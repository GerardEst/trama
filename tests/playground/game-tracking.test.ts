import { expect, test } from '@playwright/test'
import { entryAt, serveStory, token } from './mock-story'

test('a tracked story saves the game through save_game, never through the table', async ({ page }) => {
  const story = {
    id: '6f1c3c2e-9a51-4c4e-8a57-2f0d6a2a7b10', name: 'Tracking regression', cumulativeMode: false,
    tracking: true, sharing: false, tapLink: false, footer: {},
    tree: {
      refs: { stat_courage: { name: 'courage', type: 'stat' } }, categories: [], entryPoint: entryAt(),
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0, text: 'A door creaks open',
          answers: [{ id: 'answer_0_0', text: 'Step inside', join: [{ node: 'node_1' }],
            events: [{ action: 'alterStat', type: 'stat', target: 'stat_courage', amount: 2 }] }] },
        { id: 'node_1', type: 'end', left: 300, top: 0, text: `Courage: ${token('stat', 'stat_courage')}` },
      ],
    },
  }
  const saves: Record<string, unknown>[] = []
  const tableWrites: string[] = []
  await page.route('**/rest/v1/rpc/save_game', async route => {
    saves.push(route.request().postDataJSON())
    await route.fulfill({ status: 204 })
  })
  await page.route('**/rest/v1/games*', async route => {
    tableWrites.push(route.request().method())
    await route.abort()
  })
  await serveStory(page, story)

  await page.goto(`/private/${story.id}`)
  await expect(page.getByText('A door creaks open', { exact: true })).toBeVisible()
  await expect.poll(() => saves.length).toBe(1)
  expect(saves[0]).toMatchObject({ story_id: story.id, player_name: 'anonymous', game_path: [] })

  await page.getByRole('button', { name: 'Step inside', exact: true }).click()
  await expect(page.getByText('Courage: 2', { exact: true })).toBeVisible()
  await expect.poll(() => saves.length).toBe(2)

  const [started, finished] = saves
  expect(finished['game_id']).toBe(started['game_id'])
  expect(finished['game_path']).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'answer', id: 'answer_0_0' })]))
  expect(finished['game_result']).toMatchObject({ stats: { stat_courage: 2 } })
  expect(tableWrites).toEqual([])
})

test('an untracked story does not save the game', async ({ page }) => {
  const story = {
    id: '0b7c2a4e-3f1d-4b8a-9c6e-5d2f1a3b4c5d', name: 'Untracked regression', cumulativeMode: false,
    tracking: false, sharing: false, tapLink: false, footer: {},
    tree: {
      refs: {}, categories: [], entryPoint: entryAt(),
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0, text: 'Nobody is watching',
          answers: [{ id: 'answer_0_0', text: 'Leave', join: [{ node: 'node_1' }] }] },
        { id: 'node_1', type: 'end', left: 300, top: 0, text: 'Gone' },
      ],
    },
  }
  let saves = 0
  await page.route('**/rest/v1/rpc/save_game', async route => {
    saves++
    await route.fulfill({ status: 204 })
  })
  await serveStory(page, story)

  await page.goto(`/private/${story.id}`)
  await page.getByRole('button', { name: 'Leave', exact: true }).click()
  await expect(page.getByText('Gone', { exact: true })).toBeVisible()
  expect(saves).toBe(0)
})
