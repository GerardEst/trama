import type { GameState, StateChange, StoryTree } from '@trama-app/engine'
import { escapeHtml } from '../../lib/story-step'
import { KEY, TRUST } from './any-story'

// One game, told four ways. Each function turns the same engine state, and the
// changes the engine reported for the last choice, into one interface. The page
// renders the first scene at build time with them, and the browser renders
// every later step with the same code.

export interface AnyWords {
  again: string
  trust: string
  key: string
  /** "{name}" is replaced by what the answer needs. */
  needs: string
  bookTrust: string
  bookKey: string
}

export interface AnyChange {
  ref: string
  name: string
  type: 'stat' | 'condition'
  before: number
  after: number
}

export interface AnyAnswer {
  id: string
  text: string
  locked: boolean
  needs: string[]
}

export interface AnyView {
  /** The passage in front of the reader: the last one that was not skipped. */
  page: string
  /** The page was just reached; false when the story went back to its answers. */
  fresh: boolean
  /** The answer that led here. */
  chosen?: string
  /** What that answer changed, in the order the engine reported it. */
  changes: AnyChange[]
  trust: number
  hasKey: boolean
  answers: AnyAnswer[]
  ended: boolean
}

const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const amount = (value: StateChange['before']) => (typeof value === 'boolean' ? Number(value) : Number(value ?? 0))

export function viewOf(state: GameState, changes: readonly StateChange[], story: StoryTree): AnyView {
  const current = state.current
  const reached = state.visits.slice(0, state.cursor + 1)
  const shown = [...reached].reverse().find(visit => visit.scene.text && !visit.scene.skipText)
  const last = state.previousVisits.at(-1)
  const chosen = last?.scene.answers.find(answer => answer.id === last.selectedAnswerId)
  const name = (ref: string) => story.refs?.[ref]?.name ?? ref
  return {
    page: plain(shown?.scene.text ?? ''),
    fresh: !!current && !current.scene.skipText,
    chosen: chosen && plain(chosen.text),
    changes: changes
      .filter((change): change is StateChange & { type: 'stat' | 'condition' } => change.type !== 'property')
      .map(change => ({ ref: change.ref, name: name(change.ref), type: change.type, before: amount(change.before), after: amount(change.after) }))
      .filter(change => change.before !== change.after),
    trust: state.player.stats[TRUST] ?? 0,
    hasKey: state.player.conditions.includes(KEY),
    answers: state.ended
      ? []
      : (current?.scene.answers ?? []).filter(answer => answer.connected).map(answer => ({
        id: answer.id,
        text: plain(answer.text),
        locked: answer.locked,
        needs: answer.missing.map(missing => missing.name ?? missing.ref),
      })),
    ended: state.ended,
  }
}

const choice = (answer: AnyAnswer | undefined, inner: string, className: string) =>
  answer?.locked
    ? `<button type="button" class="${className} is-locked" disabled>${inner}</button>`
    : `<button type="button" class="${className}" data-answer="${escapeHtml(answer?.id ?? '')}">${inner}</button>`

const needs = (answer: AnyAnswer, words: AnyWords) =>
  escapeHtml(words.needs.replace('{name}', answer.needs.join(', ')))

const LOCK = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>'

/** A log: every event is one more printed line. */
export function renderTerminal(view: AnyView, words: AnyWords): string {
  const lines: string[] = []
  if (view.chosen) lines.push(`<p class="ai-dim">? ${escapeHtml(view.chosen)}</p>`)
  for (const change of view.changes) {
    const text = change.type === 'stat'
      ? `${change.name} ${change.before} → ${change.after}`
      : `${change.after ? '+' : '−'} ${change.name}`
    lines.push(`<p class="ai-term-event">» ${escapeHtml(text)}</p>`)
  }
  if (view.fresh) lines.push(`<p>&gt; ${escapeHtml(view.page)}</p>`)
  view.answers.forEach((answer, index) => {
    const lock = answer.locked ? ` <em>[${needs(answer, words)}]</em>` : ''
    lines.push(choice(answer, `<span>${index + 1}</span> ${escapeHtml(answer.text)}${lock}`, 'ai-term-choice'))
  })
  lines.push(view.ended ? choice(undefined, `<span>↺</span> ${escapeHtml(words.again)}`, 'ai-term-choice ai-again') : '<p class="ai-caret">? <i></i></p>')
  return lines.join('')
}

/** A conversation: events arrive as notices between the messages. */
export function renderChat(view: AnyView, words: AnyWords): string {
  const bubbles: string[] = []
  if (view.chosen) bubbles.push(`<p class="ai-bubble ai-bubble--me">${escapeHtml(view.chosen)}</p>`)
  for (const change of view.changes) {
    const text = change.type === 'stat'
      ? `${change.name} ${change.after > change.before ? '+' : '−'}${Math.abs(change.after - change.before)}`
      : `${change.after ? '+' : '−'} ${change.name}`
    bubbles.push(`<p class="ai-notice">${escapeHtml(text)}</p>`)
  }
  if (view.fresh || !view.chosen) bubbles.push(`<p class="ai-bubble">${escapeHtml(view.page)}</p>`)
  const chips = view.ended
    ? choice(undefined, `↺ ${escapeHtml(words.again)}`, 'ai-chip ai-again')
    : view.answers.map(answer => choice(answer, answer.locked ? `${LOCK} ${escapeHtml(answer.text)}` : escapeHtml(answer.text), 'ai-chip')).join('')
  return `<div class="ai-thread">${bubbles.join('')}</div><div class="ai-chips">${chips}</div>`
}

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v']
const BOOK_KEY = '<svg class="ai-book-key" aria-hidden="true" viewBox="0 0 48 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="10" r="6"/><circle cx="9" cy="10" r="2.5"/><path d="M15 10h29M37 10v6M42 10v4"/></svg>'

/** A book: events become sentences in the margin, and the key is drawn on the page. */
export function renderBook(view: AnyView, words: AnyWords): string {
  const [first = '', ...rest] = view.page
  const notes = view.changes
    .map(change => (change.ref === TRUST && change.after > change.before ? words.bookTrust : change.ref === KEY && change.after ? words.bookKey : ''))
    .filter(Boolean)
    .map(note => `<p class="ai-book-note">❧ ${escapeHtml(note)}</p>`)
    .join('')
  const choices = view.ended
    ? choice(undefined, `<i>↺</i> ${escapeHtml(words.again)}`, 'ai-book-choice ai-again')
    : view.answers.map((answer, index) => {
      const lock = answer.locked ? ` <em>— ${needs(answer, words)}</em>` : ''
      return choice(answer, `<i>${ROMAN[index]}.</i> ${escapeHtml(answer.text)}${lock}`, 'ai-book-choice')
    }).join('')
  return `<p class="ai-book-text">${view.hasKey ? BOOK_KEY : ''}<b>${escapeHtml(first)}</b>${escapeHtml(rest.join(''))}</p>${notes}<div class="ai-book-choices">${choices}</div>`
}

const PIXEL_KEY = '<svg aria-hidden="true" viewBox="0 0 12 5" shape-rendering="crispEdges"><path fill="currentColor" fill-rule="evenodd" d="M0 0h5v5H0zM1 1v3h3V1zM5 2h7v1H5zM9 3h1v2H9zM11 3h1v1h-1z"/></svg>'

/** A game: events move the HUD, with hearts for trust and an inventory slot for the key. */
export function renderGame(view: AnyView, words: AnyWords): string {
  const trustChange = view.changes.find(change => change.ref === TRUST)
  const keyChange = view.changes.find(change => change.ref === KEY)
  const slots = Math.max(2, view.trust)
  const hearts = Array.from({ length: slots }, (_, index) => {
    const full = index < view.trust
    const isNew = full && trustChange && index >= trustChange.before
    return `<i class="${full ? 'is-full' : ''}${isNew ? ' is-new' : ''}">${full ? '♥' : '♡'}</i>`
  }).join('')
  const pop = trustChange && trustChange.after > trustChange.before ? `<span class="ai-game-pop">+${trustChange.after - trustChange.before}</span>` : ''
  const slot = `<span class="ai-game-slot${keyChange?.after ? ' is-new' : ''}"${view.hasKey ? ` role="img" aria-label="${escapeHtml(words.key)}"` : ''}>${view.hasKey ? PIXEL_KEY : ''}</span>`
  const choices = view.ended
    ? choice(undefined, `▶ ${escapeHtml(words.again)}`, 'ai-game-choice ai-again')
    : view.answers.map(answer => choice(answer, `${answer.locked ? '▷' : '▶'} ${escapeHtml(answer.text)}${answer.locked ? ` <small>${LOCK} ${needs(answer, words)}</small>` : ''}`, 'ai-game-choice')).join('')
  return `<p class="ai-game-hud"><span class="ai-game-hearts" role="img" aria-label="${escapeHtml(`${words.trust} ${view.trust}`)}">${hearts}${pop}</span>${slot}</p><p class="ai-game-text">${escapeHtml(view.page)}</p><div class="ai-game-choices">${choices}</div>`
}
