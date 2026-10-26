import { tree } from 'src/app/core/interfaces/interfaces'
import { appRoutes } from 'src/app/routes'
import { brokenStoryAnswerCount, RESERVED_STORY_PATHS, storyReadingUrl, validateStorySlug } from './story-sharing'

describe('story sharing links', () => {
  it('accepts short readable slugs and rejects malformed addresses', () => {
    for (const slug of ['a', 'the-island', 'story-2026']) expect(validateStorySlug(slug)).toBeNull()
    for (const slug of ['', ' two ', 'UPPER', 'a/b', 'a?b', 'a#b', 'a_b', '-a', 'a-', 'a--b', 'a'.repeat(81)]) {
      expect(validateStorySlug(slug)).withContext(slug).toBe('format')
    }
  })

  it('reserves every static root route so future application pages cannot shadow story links', () => {
    for (const route of appRoutes) {
      const root = route.path?.split('/')[0]
      if (root && !root.startsWith(':')) expect(RESERVED_STORY_PATHS.has(root)).withContext(root).toBeTrue()
    }
    expect(validateStorySlug('ca')).toBe('reserved')
    expect(validateStorySlug('dashboard')).toBe('reserved')
  })

  it('prefers the saved alias, with a stable fallback for absent or unsafe legacy aliases', () => {
    expect(storyReadingUrl('https://trama.app/', 'id', 'the-island')).toBe('https://trama.app/the-island')
    for (const alias of [null, undefined, '', 'ca', 'old_alias', 'path/other']) {
      expect(storyReadingUrl('https://trama.app', 'id', alias)).toBe('https://trama.app/private/id')
    }
  })

  it('warns about broken choices without counting placeholders, locks or loops as errors', () => {
    const story: tree = { refs: {}, categories: [], nodes: [
      { id: 'a', type: 'content', left: 0, top: 0, answers: [
        { id: 'empty', text: '<p><br></p>' },
        { id: 'unfinished', text: 'Keep going' },
        { id: 'broken', text: 'Missing scene', join: [{ node: 'missing' }] },
        { id: 'group', text: 'Not executable', join: [{ node: 'group' }] },
        { id: 'mixed', text: 'One broken random destination', join: [{ node: 'a' }, { node: 'missing' }] },
        { id: 'loop', text: 'Again', join: [{ node: 'a' }] },
      ] },
      { id: 'group', type: 'group', left: 0, top: 0 },
    ] }
    expect(brokenStoryAnswerCount(story)).toBe(4)
  })
})
