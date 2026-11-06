import { describe, expect, it } from 'vitest'
import { createGame, fetchStory, PublishedStory, StoryRequestError, TRAMA_STORY_API } from '../src'

const story: PublishedStory = {
  id: 'story-1', name: 'The island', slug: 'the-island',
  settings: { cumulativeMode: false, sharing: true, tapLink: false, tracking: false, footer: {} },
  tree: { entryPoint: { targetNodeId: 'node_0' }, nodes: [{ id: 'node_0', type: 'end', text: '<p>The end</p>' }] },
}
const respond = (status: number, body: unknown = {}) => async () => ({ ok: status < 300, status, json: async () => body })

describe('fetchStory', () => {
  it('asks Trama for a story by id or by slug and returns it ready to play', async () => {
    const urls: string[] = []
    const load = async (url: string) => { urls.push(url); return respond(200, story)() }
    const loaded = await fetchStory({ id: 'story-1' }, { fetch: load })
    await fetchStory({ slug: 'the island' }, { fetch: load, api: 'https://example.test/story' })
    expect(urls).toEqual([`${TRAMA_STORY_API}?id=story-1`, 'https://example.test/story?slug=the%20island'])
    expect(createGame(loaded!.tree).start().current?.scene.text).toBe('<p>The end</p>')
  })

  it('resolves undefined for a missing story and throws for other failures', async () => {
    expect(await fetchStory({ slug: 'missing' }, { fetch: respond(404) })).toBeUndefined()
    await expect(fetchStory({ id: 'x' }, { fetch: respond(503) })).rejects.toBeInstanceOf(StoryRequestError)
    await expect(fetchStory({ id: 'x' }, { fetch: respond(400) })).rejects.toMatchObject({ status: 400 })
  })
})
