import { describe, expect, it } from 'vitest'
import { engineExample, referenceCode, storyReference } from './story-reference'

const id = '3df4a8cd-26e7-4d76-b33b-c068f572698b'

describe('storyReference', () => {
  it('reads ids from sharing links and bare ids', () => {
    expect(storyReference(`https://trama.app/private/${id}`)).toEqual({ id })
    expect(storyReference(`  ${id.toUpperCase()} `)).toEqual({ id })
  })

  it('reads custom addresses from links and bare slugs', () => {
    expect(storyReference('https://trama.app/the-island?ref=mail#start')).toEqual({ slug: 'the-island' })
    expect(storyReference('trama.app/the-island/')).toEqual({ slug: 'the-island' })
    expect(storyReference('the-island')).toEqual({ slug: 'the-island' })
  })

  it('rejects what the story API would not accept', () => {
    expect(storyReference('')).toBeNull()
    expect(storyReference('The Island!')).toBeNull()
    expect(storyReference('a'.repeat(81))).toBeNull()
  })
})

describe('referenceCode', () => {
  it('writes the fetchStory argument, or a placeholder without a story', () => {
    expect(referenceCode(null, 'YOUR_STORY_ID')).toBe(`{ id: 'YOUR_STORY_ID' }`)
    expect(referenceCode({ id }, 'YOUR_STORY_ID')).toBe(`{ id: '${id}' }`)
    expect(referenceCode({ slug: 'the-island' }, 'YOUR_STORY_ID')).toBe(`{ slug: 'the-island' }`)
  })

  it('places the reference in the example code', () => {
    expect(engineExample(`{ slug: 'the-island' }`)).toContain(`fetchStory({ slug: 'the-island' })`)
  })
})
