import { tree } from 'src/app/core/interfaces/interfaces'
import { storyPlainText } from './story-html'

// Root-level application routes and static resources must never become story URLs.
export const RESERVED_STORY_PATHS = new Set([
  'ca', 'es', 'en', 'login', 'dashboard', 'reset-password', 'change-password',
  'stadistics', 'private', 'not-found', 'docs', 'assets', 'api',
])

export function validateStorySlug(value: string): 'format' | 'reserved' | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || value.length > 80) return 'format'
  return RESERVED_STORY_PATHS.has(value) ? 'reserved' : null
}

export function storyReadingUrl(base: string, storyId: string, customId?: string | null): string {
  const path = customId && !validateStorySlug(customId)
    ? customId
    : `private/${encodeURIComponent(storyId)}`
  return `${base.replace(/\/$/, '')}/${path}`
}

/** Warn about unfinished authored choices, not intentional loops or empty placeholders. */
export function brokenStoryAnswerCount(story: tree): number {
  const playableIds = new Set(story.nodes.filter(node => node.type !== 'group').map(node => node.id))
  return story.nodes.reduce((count, node) => count + (node.answers ?? []).filter(answer => {
    if (!answer.join?.length && !storyPlainText(answer.text).trim()) return false
    return !answer.join?.length || answer.join.some(join => !playableIds.has(join.node))
  }).length, 0)
}

export async function copyStoryLink(url: string): Promise<'copied' | 'manual'> {
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'manual'
  }
}

export async function shareStoryLink(data: ShareData): Promise<'shared' | 'copied' | 'manual' | 'cancelled'> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }
  return copyStoryLink(data.url ?? '')
}
