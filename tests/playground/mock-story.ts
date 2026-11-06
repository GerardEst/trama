import { Page } from '@playwright/test'

export interface MockStory {
  id: string
  name: string
  tree: Record<string, unknown>
  cumulativeMode?: boolean
  sharing?: boolean
  tapLink?: boolean
  tracking?: boolean
  footer?: { text?: string; link?: string }
  custom_id?: string | null
}

/** A stored story as the public `story` function returns it. */
export function publishedStory(story: MockStory) {
  return {
    id: story.id,
    name: story.name,
    slug: story.custom_id ?? null,
    settings: {
      cumulativeMode: !!story.cumulativeMode,
      sharing: !!story.sharing,
      tapLink: !!story.tapLink,
      tracking: !!story.tracking,
      footer: story.footer ?? {},
    },
    tree: story.tree,
  }
}

/** Answers the player's request for this story, as the public API would. */
export async function serveStory(page: Page, story: MockStory) {
  await page.route('**/functions/v1/story?*', route => route.fulfill({ json: publishedStory(story) }))
}

/** Serves a story and opens it in the player. */
export async function openMockStory(page: Page, story: MockStory) {
  await serveStory(page, story)
  await page.goto(`/private/${story.id}`)
}

/** A variable as the rich-text editor saves it. */
export function token(kind: 'property' | 'stat' | 'condition', key: string) {
  return `<span data-trama-variable="" data-kind="${kind}" data-key="${key}">#${key}</span>`
}

/** Starts at the first node. */
export function entryAt(nodeId = 'node_0') {
  return { left: 0, top: 0, targetNodeId: nodeId }
}
