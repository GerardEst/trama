import { PlayerState, Story } from './types'

// The editor marks variables with explicit tokens:
//   <span data-trama-variable data-kind="stat" data-key="stat_gold">#stat_gold</span>
//   <div data-trama-category data-key="inventory">[inventory]</div>
// Anything else, including a literal #word, is authored text and stays as it is.
const VARIABLE_PATTERN = /<span\b([^>]*\bdata-trama-variable\b[^>]*)>[\s\S]*?<\/span>/gi
const CATEGORY_PATTERN = /<div\b([^>]*\bdata-trama-category\b[^>]*)>[\s\S]*?<\/div>/gi
const PARAGRAPH_PATTERN = /<p\b[^>]*>[\s\S]*?<\/p>/gi

/** Resolves variable and category tokens. Player values are escaped. */
export function interpolate(text: string = '', story: Story, player: PlayerState): string {
  if (!text.includes('data-trama-')) return text
  return text
    .replace(VARIABLE_PATTERN, (match, attributes: string) => {
      const kind = attribute(attributes, 'data-kind')
      const key = attribute(attributes, 'data-key')
      if (!key || !['property', 'stat', 'condition'].includes(kind ?? '')) return match
      let value: string | number | undefined
      if (kind === 'property') value = player.properties[key]
      if (kind === 'stat') value = player.stats[key]
      if (kind === 'condition') value = player.conditions.includes(key) ? 'true' : undefined
      return escapeHtml(String(value ?? '-'))
    })
    .replace(CATEGORY_PATTERN, (match, attributes: string) => {
      const key = attribute(attributes, 'data-key')
      if (!key) return match
      const entries = categoryEntries(key, story, player).join('\n')
      return `<div class="storyCategory__entries">${escapeHtml(entries)}</div>`
    })
}

/** Answer buttons hold phrasing content: paragraphs become line breaks. */
export function inlineHtml(html: string = ''): string {
  const paragraphs = html.match(PARAGRAPH_PATTERN)
  if (!paragraphs || html.replace(PARAGRAPH_PATTERN, '').trim()) return html
  return paragraphs.map(paragraph => paragraph.replace(/^<p\b[^>]*>|<\/p>$/gi, '')).join('<br>')
}

/** Text content of a story fragment, without markup. */
export function plainText(html: string = ''): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ''))
}

/** Owned refs of a category: stats with their amount first, then conditions. */
function categoryEntries(category: string, story: Story, player: PlayerState) {
  const refs = Object.entries(story.refs).filter(([, ref]) => ref.category === category)
  return [
    ...refs.filter(([id]) => id in player.stats)
      .map(([id, ref]) => `${capitalize(ref.name)}: ${player.stats[id]}`),
    ...refs.filter(([id]) => player.conditions.includes(id))
      .map(([, ref]) => capitalize(ref.name)),
  ]
}

function attribute(attributes: string, name: string) {
  const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(attributes)
  return match ? decodeEntities(match[1] ?? match[2] ?? '') : undefined
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function decodeEntities(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|nbsp|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
    const named: Record<string, string> = { nbsp: '\u00a0', amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'' }
    const lower = entity.toLowerCase()
    if (lower in named) return named[lower]
    const code = lower.startsWith('#x') ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10)
    return Number.isFinite(code) ? String.fromCodePoint(code) : match
  })
}
