// Public read API for one story, by id or by its custom address (slug).
// Stories cannot be listed: a caller must already know the id or the slug.
// Only what a player needs is returned: no owner, no editor layout.

export interface StoryRow {
  id: string
  name: string
  custom_id: string | null
  tree: SavedTree | null
  cumulativeMode: boolean | null
  sharing: boolean | null
  tapLink: boolean | null
  tracking: boolean | null
  footer: { text?: string; link?: string } | null
}

interface SavedNode {
  id: string
  type?: string
  top?: unknown
  left?: unknown
  groupId?: unknown
  [field: string]: unknown
}

export interface SavedTree {
  nodes?: SavedNode[]
  refs?: unknown
  categories?: unknown
  entryPoint?: { targetNodeId?: string; left?: number; top?: number }
  unavailableAnswerDisplay?: string
  [editorOnly: string]: unknown
}

export type LoadStory = (column: 'id' | 'custom_id', value: string) => Promise<StoryRow | null>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
}

export function createHandler(load: LoadStory) {
  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

    const params = new URL(request.url).searchParams
    const id = params.get('id')
    const slug = params.get('slug')
    if (id && !UUID.test(id)) return json({ error: 'invalid_id' }, 400)
    if (slug && (!SLUG.test(slug) || slug.length > 80)) return json({ error: 'invalid_slug' }, 400)
    if (!id === !slug) return json({ error: 'id_or_slug_required' }, 400)

    let row: StoryRow | null
    try {
      row = id ? await load('id', id) : await load('custom_id', slug!)
    } catch (error) {
      console.error('Could not load the story', error)
      return json({ error: 'unavailable' }, 503)
    }
    if (!row) return json({ error: 'not_found' }, 404)

    return json({
      id: row.id,
      name: row.name,
      slug: row.custom_id,
      settings: {
        cumulativeMode: !!row.cumulativeMode,
        sharing: !!row.sharing,
        tapLink: !!row.tapLink,
        tracking: !!row.tracking,
        footer: row.footer ?? {},
      },
      tree: playableTree(row.tree ?? {}),
    }, 200, { 'Cache-Control': 'public, max-age=30' })
  }
}

/** The story without board layout: groups, frames and node positions. */
export function playableTree(tree: SavedTree) {
  const nodes = Array.isArray(tree.nodes) ? tree.nodes : []
  const entryPoint = tree.entryPoint
  return {
    nodes: nodes
      .filter(node => node.type !== 'group')
      .map(({ top: _top, left: _left, groupId: _groupId, ...node }) => node),
    refs: tree.refs ?? {},
    categories: tree.categories ?? [],
    entryPoint: entryPoint?.targetNodeId ? { targetNodeId: entryPoint.targetNodeId } : {},
    ...(tree.unavailableAnswerDisplay ? { unavailableAnswerDisplay: tree.unavailableAnswerDisplay } : {}),
  }
}

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}
