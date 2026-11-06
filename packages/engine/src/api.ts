import { StoryTree } from './types'

/** Trama's public story API. */
export const TRAMA_STORY_API = 'https://lsemostpqoguehpsbzgu.supabase.co/functions/v1/story'

export interface StorySettings {
  /** Show earlier steps above the current one. */
  cumulativeMode: boolean
  sharing: boolean
  /** Hide the "Created with Trama" link. */
  tapLink: boolean
  tracking: boolean
  footer: { text?: string; link?: string }
}

/** A story as Trama's API serves it: ready to pass to `createGame`. */
export interface PublishedStory {
  id: string
  name: string
  /** The custom address set by the author, if any. */
  slug: string | null
  settings: StorySettings
  tree: StoryTree
}

export type StoryReference = { id: string } | { slug: string }

export interface StoryResponse {
  ok: boolean
  status: number
  json(): Promise<unknown>
}

export interface FetchStoryOptions {
  /** Defaults to Trama's public API. */
  api?: string
  /** Defaults to the global fetch. */
  fetch?: (url: string) => Promise<StoryResponse>
}

export class StoryRequestError extends Error {
  constructor(readonly status: number) {
    super(`The story could not be loaded (HTTP ${status})`)
    this.name = 'StoryRequestError'
  }
}

/**
 * Loads a story by its id or its custom address. Resolves undefined when it
 * does not exist and throws StoryRequestError for any other failure.
 */
export async function fetchStory(reference: StoryReference, options: FetchStoryOptions = {}): Promise<PublishedStory | undefined> {
  const query = 'id' in reference
    ? `id=${encodeURIComponent(reference.id)}`
    : `slug=${encodeURIComponent(reference.slug)}`
  // The global fetch of browsers, Node 18+, Deno and workers, typed without the DOM library.
  const load = options.fetch ?? (globalThis as unknown as Required<FetchStoryOptions>).fetch
  const response = await load(`${options.api ?? TRAMA_STORY_API}?${query}`)
  if (response.status === 404) return undefined
  if (!response.ok) throw new StoryRequestError(response.status)
  return await response.json() as PublishedStory
}
