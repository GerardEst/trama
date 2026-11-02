import { Page } from '@playwright/test'

export interface MockStory {
  id: string
  name: string
  tree: Record<string, unknown>
  cumulativeMode?: boolean
  sharing?: boolean
}

/** Serves a story as the stories endpoint would and opens it in the player. */
export async function openMockStory(page: Page, story: MockStory) {
  const row = { tracking: false, sharing: false, tapLink: false, footer: {}, cumulativeMode: false, custom_id: null, ...story }
  await page.route('**/rest/v1/stories?*', route => route.fulfill({ json: [row] }))
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
