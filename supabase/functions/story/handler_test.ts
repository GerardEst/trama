/// <reference lib="deno.ns" />
import { createHandler, StoryRow } from './handler.ts'

function assertEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const id = '00000000-0000-4000-8000-000000000012'
const row: StoryRow = {
  id, name: 'The island', custom_id: 'the-island', cumulativeMode: true, sharing: false, tapLink: null,
  tracking: false, footer: null,
  tree: {
    refs: { stat_gold: { name: 'gold', type: 'stat' } }, categories: [],
    entryPoint: { left: 4820, top: 4900, targetNodeId: 'node_0' },
    frames: [{ id: 'frame_0', name: 'Start', nodeIds: ['node_0'] }],
    nodes: [
      { id: 'node_0', type: 'content', top: 5000, left: 5000, groupId: 'node_2', name: 'Arrival', text: '<p>Hi</p>' },
      { id: 'node_2', type: 'group', top: 5000, left: 5000, text: 'Chapter' },
    ],
  },
}
const calls: Array<[string, string]> = []
const handler = createHandler(async (column, value) => {
  calls.push([column, value])
  return (column === 'id' && value === id) || (column === 'custom_id' && value === 'the-island') ? row : null
})
const get = (query: string) => handler(new Request(`https://example.test/story${query}`))

Deno.test('returns only what a player needs, by id or by slug', async () => {
  for (const query of [`?id=${id}`, '?slug=the-island']) {
    const response = await get(query)
    assertEquals(response.status, 200)
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
    assertEquals(await response.json(), {
      id, name: 'The island', slug: 'the-island',
      settings: { cumulativeMode: true, sharing: false, tapLink: false, tracking: false, footer: {} },
      tree: {
        nodes: [{ id: 'node_0', type: 'content', name: 'Arrival', text: '<p>Hi</p>' }],
        refs: { stat_gold: { name: 'gold', type: 'stat' } }, categories: [],
        entryPoint: { targetNodeId: 'node_0' },
      },
    })
  }
})

Deno.test('cannot list stories or query with anything but an exact id or slug', async () => {
  calls.length = 0
  assertEquals((await get('')).status, 400)
  assertEquals((await get(`?id=${id}&slug=the-island`)).status, 400)
  assertEquals((await get('?id=not-a-uuid')).status, 400)
  assertEquals((await get('?slug=The%20Island')).status, 400)
  assertEquals((await get('?slug=a,b')).status, 400)
  assertEquals(calls, [])
  assertEquals((await get('?slug=missing')).status, 404)
})

Deno.test('keeps a disconnected start disconnected', async () => {
  const disconnected = createHandler(async () => ({ ...row, tree: { nodes: [], entryPoint: { left: 0, top: 0 } } }))
  const body = await (await disconnected(new Request(`https://example.test/story?id=${id}`))).json()
  assertEquals(body.tree.entryPoint, {})
})

Deno.test('answers preflight and rejects writes', async () => {
  assertEquals((await handler(new Request('https://example.test/story', { method: 'OPTIONS' }))).status, 204)
  assertEquals((await handler(new Request('https://example.test/story', { method: 'POST' }))).status, 405)
})

Deno.test('reports a failing database without details', async () => {
  const failing = createHandler(async () => { throw new Error('connection refused') })
  const original = console.error
  console.error = () => {}
  try {
    const response = await failing(new Request(`https://example.test/story?id=${id}`))
    assertEquals(response.status, 503)
    assertEquals(await response.json(), { error: 'unavailable' })
  } finally {
    console.error = original
  }
})
