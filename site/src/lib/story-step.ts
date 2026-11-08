import type { GameState, MissingRequirement, SceneAnswer, Visit } from '@trama-app/engine'
import { format } from './format'

// Renders what the reader acts on now, the same way Trama's own player does.
// Used at build time for the first scene and in the browser for every move,
// so the static HTML and the interactive demo cannot drift apart.

export interface StepStrings {
  unavailable: string
  stat: string
  condition: string
  absentCondition: string
  unknown: string
  yourAnswer: string
  continue: string
}

export function renderStep(state: GameState, strings: StepStrings): string {
  return state.activeVisits.map(visit => renderVisit(visit, strings)).join('')
}

function renderVisit(visit: Visit, strings: StepStrings): string {
  const { scene } = visit
  const image = scene.image
    ? `<img class="node__image" src="${escapeHtml(scene.image.url)}" alt="" loading="lazy">`
    : ''
  // Story text is authored HTML; variables inside it are escaped by the engine.
  const passage = scene.text && !scene.skipText ? `<div class="node__passage">${scene.text}</div>` : ''
  const answers = scene.answers.length
    ? `<div class="node__answers">${scene.answers.map(answer => renderAnswer(answer, visit, strings)).join('')}</div>`
    : ''
  const input = scene.type === 'text' && visit.userResponse === undefined ? renderTextInput(visit, strings) : ''
  return `<article class="node" data-visit="${visit.id}">${image}<div class="node__content">${passage}${answers}${input}</div></article>`
}

function renderAnswer(answer: SceneAnswer, visit: Visit, strings: StepStrings): string {
  const disabled = answer.locked || !answer.connected
  const selected = visit.selectedAnswerId === answer.id
  const locked = answer.locked
    ? `<span class="answer__locked"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg>${escapeHtml(strings.unavailable)}</span>`
      + (answer.display === 'requirements'
        ? answer.missing.map(missing => `<span class="answer__requirement">${escapeHtml(describeMissing(missing, strings))}</span>`).join('')
        : '')
    : ''
  return `<button type="button" class="answer${selected ? ' answer--selected' : ''}" data-answer="${escapeHtml(answer.id)}"${disabled ? ' disabled' : ''}><span>${answer.text}</span>${locked}</button>`
}

function renderTextInput(visit: Visit, strings: StepStrings): string {
  const input = visit.scene.input
  const id = `story-input-${visit.id}`
  const label = input?.description || strings.yourAnswer
  return `<form class="node__form" data-text-input><label for="${id}">${escapeHtml(label)}</label>`
    + `<input id="${id}" name="answer" type="text" autocomplete="off" required maxlength="100" placeholder="${escapeHtml(input?.placeholder ?? '')}">`
    + `<button type="submit">${escapeHtml(input?.buttonText || strings.continue)}</button></form>`
}

/** Never shows internal ref ids, even for deleted or malformed references. */
export function describeMissing(missing: MissingRequirement, strings: StepStrings): string {
  const { name, required, current } = missing
  if (!name || !Number.isFinite(required)) return strings.unknown
  if (missing.type === 'stat') return format(strings.stat, { name, amount: required, current })
  return format(required === 1 ? strings.condition : strings.absentCondition, { name })
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
