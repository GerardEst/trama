export type StoryReference = { id: string } | { slug: string }

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Reads a story id, custom address or sharing link the way the public story API expects it. */
export function storyReference(input: string): StoryReference | null {
  const value = input.trim()
  if (!value) return null
  const id = value.match(UUID)?.[0]
  if (id) return { id: id.toLowerCase() }
  const slug = value.split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? ''
  return SLUG.test(slug) && slug.length <= 80 ? { slug } : null
}

/** The fetchStory() argument as code, with a placeholder id until a story is given. */
export function referenceCode(reference: StoryReference | null, placeholderId: string): string {
  if (!reference) return `{ id: '${placeholderId}' }`
  return 'id' in reference ? `{ id: '${reference.id}' }` : `{ slug: '${reference.slug}' }`
}

export function engineExample(code: string): string {
  return [
    'npm install @trama-app/engine',
    '',
    `import { createGame, fetchStory } from '@trama-app/engine'`,
    '',
    `const story = await fetchStory(${code})`,
    'const game = createGame(story.tree)',
    'game.subscribe(event => {',
    `  if (event.type === 'state') draw(event.state)`,
    '})',
    'game.start()',
  ].join('\n')
}
