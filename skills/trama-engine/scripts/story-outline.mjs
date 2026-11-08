#!/usr/bin/env node
// Compact outline of a Trama story: settings, refs, every node with its exits,
// and structural problems. Much smaller than the raw tree, so read this first.
//
//   node story-outline.mjs --slug the-island
//   node story-outline.mjs --id 3df4a8cd-26e7-4d76-b33b-c068f572698b
//   node story-outline.mjs story.json              (a published story or a bare tree)
//   node story-outline.mjs --slug the-island --save story.json   (also keep the full JSON)
//
// No dependencies. Node 18+.

import { readFile, writeFile } from 'node:fs/promises'

const API = 'https://lsemostpqoguehpsbzgu.supabase.co/functions/v1/story'
const EXCERPT = 90

const args = process.argv.slice(2)
const option = name => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}
const file = args.find((arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--'))

const story = await load()
if (option('save')) await writeFile(option('save'), JSON.stringify(story, null, 2))
console.log(outline(story))

async function load() {
  const id = option('id')
  const slug = option('slug')
  if (id || slug) {
    const response = await fetch(`${API}?${id ? `id=${encodeURIComponent(id)}` : `slug=${encodeURIComponent(slug)}`}`)
    if (response.status === 404) fail(`No story with ${id ? `id ${id}` : `slug ${slug}`}`)
    if (!response.ok) fail(`The story API answered HTTP ${response.status}`)
    return response.json()
  }
  if (!file) fail('Usage: story-outline.mjs (--id <uuid> | --slug <slug> | <file.json>) [--save <file.json>]')
  const json = JSON.parse(await readFile(file, 'utf8'))
  return json.tree ? json : { name: json.name ?? file, tree: json }
}

function outline(story) {
  const tree = story.tree ?? {}
  const nodes = (tree.nodes ?? []).filter(node => node.type !== 'group')
  const byId = new Map(nodes.map(node => [node.id, node]))
  const refs = tree.refs ?? {}
  const entry = tree.entryPoint?.targetNodeId
  const lines = []
  const problems = []

  lines.push(`# ${story.name ?? 'Untitled story'}`)
  if (story.id) lines.push(`id: ${story.id}${story.slug ? `  slug: ${story.slug}` : ''}`)
  if (story.settings) {
    const { cumulativeMode, sharing, tapLink, footer } = story.settings
    lines.push(`settings: cumulativeMode=${cumulativeMode} sharing=${sharing} hideTramaLink=${tapLink}` +
      (footer?.text || footer?.link ? ` footer=${JSON.stringify(footer)}` : ''))
  }
  const counts = {}
  for (const node of nodes) counts[node.type ?? 'untyped'] = (counts[node.type ?? 'untyped'] ?? 0) + 1
  lines.push(`nodes: ${nodes.length} (${Object.entries(counts).map(([type, count]) => `${count} ${type}`).join(', ')})`)
  lines.push(`entry: ${entry ?? '(none)'}  locked answers: ${tree.unavailableAnswerDisplay ?? 'hidden'}`)

  const refEntries = Object.entries(refs)
  if (refEntries.length) {
    lines.push('', '## Refs')
    for (const [id, ref] of refEntries) {
      lines.push(`- ${id}: ${ref.type} "${ref.name}"${ref.category ? ` [${categoryName(tree, ref.category)}]` : ''}`)
    }
  }

  lines.push('', '## Nodes')
  for (const node of nodes) {
    const label = node.name ? ` "${node.name}"` : ''
    lines.push(`${node.id} ${node.type}${label}${node.id === entry ? ' (START)' : ''}${node.image?.path ? ' [image]' : ''}`)
    const text = excerpt(node.text)
    if (text) lines.push(`  | ${text}`)
    if (node.events?.length) lines.push(`  on enter: ${node.events.map(event => describeEvent(event, refs)).join('; ')}`)
    if (node.type === 'text') {
      const property = node.userTextOptions?.property
      lines.push(`  asks text${property ? ` -> property ${property}` : ''}`)
    }
    for (const answer of node.answers ?? []) {
      const extras = [
        answer.requirements?.length && `needs ${answer.requirements.map(req => describeRequirement(req, refs)).join(' & ')}`,
        answer.events?.length && `does ${answer.events.map(event => describeEvent(event, refs)).join('; ')}`,
      ].filter(Boolean)
      lines.push(`  > ${answer.id} "${excerpt(answer.text, 50)}" -> ${targets(answer.join)}${extras.length ? `  (${extras.join(', ')})` : ''}`)
    }
    for (const route of node.conditions ?? []) {
      const rules = (route.rules ?? []).map(rule => describeRule(rule, refs)).join(' & ') || '(no rules: never matches)'
      lines.push(`  ? if ${rules} -> ${targets(route.join)}`)
    }
    if (node.type === 'distributor') lines.push(`  ? else -> ${targets(node.fallbackCondition?.join)}`)
    if (node.join?.length && node.type !== 'distributor') lines.push(`  -> ${targets(node.join)}`)
    if (node.links?.length) lines.push(`  links: ${node.links.map(link => `${link.name} <${link.url}>`).join(', ')}`)
  }

  // Structural checks. Reachability ignores requirements and rules.
  if (!entry) problems.push('No start: entryPoint has no target.')
  else if (!byId.has(entry)) problems.push(`Start points to missing node ${entry}.`)
  const reached = new Set()
  const queue = entry && byId.has(entry) ? [entry] : []
  while (queue.length) {
    const id = queue.shift()
    if (reached.has(id)) continue
    reached.add(id)
    for (const join of exits(byId.get(id))) if (byId.has(join.node)) queue.push(join.node)
  }
  for (const node of nodes) {
    for (const join of exits(node)) {
      if (!byId.has(join.node)) problems.push(`${node.id} links to missing node ${join.node}.`)
    }
    if (entry && !reached.has(node.id)) problems.push(`${node.id} is unreachable from the start.`)
    if (node.type !== 'end' && !exits(node).length) problems.push(`${node.id} (${node.type}) has no way forward and is not an ending.`)
    for (const answer of node.answers ?? []) {
      if (!answer.join?.length) problems.push(`${node.id}: answer ${answer.id} is not connected.`)
    }
    for (const ref of usedRefs(node)) {
      if (!refs[ref]) problems.push(`${node.id} uses ${ref}, which is not defined in refs.`)
    }
  }
  if (!nodes.some(node => node.type === 'end')) problems.push('The story has no ending.')

  lines.push('', '## Problems', ...(problems.length ? problems.map(problem => `- ${problem}`) : ['none found']))
  return lines.join('\n')
}

function exits(node) {
  if (!node) return []
  return [
    ...(node.join ?? []),
    ...(node.answers ?? []).flatMap(answer => answer.join ?? []),
    ...(node.conditions ?? []).flatMap(route => route.join ?? []),
    ...(node.fallbackCondition?.join ?? []),
  ]
}

function usedRefs(node) {
  const events = [...(node.events ?? []), ...(node.answers ?? []).flatMap(answer => answer.events ?? [])]
  return new Set([
    ...events.filter(event => event.action !== 'alterProperty').map(event => event.target),
    ...(node.answers ?? []).flatMap(answer => answer.requirements ?? []).map(req => req.target),
    ...(node.conditions ?? []).flatMap(route => route.rules ?? []).map(rule => rule.ref),
  ].filter(Boolean))
}

function targets(joins = []) {
  if (!joins.length) return '(nothing)'
  const list = joins.map(join => `${join.node}${join.toAnswer ? ' (answers only)' : ''}`)
  return list.length > 1 ? `random of [${list.join(', ')}]` : list[0]
}

function describeEvent(event, refs) {
  const name = refName(event.target, refs)
  if (event.action === 'alterStat') return `${name} ${Number(event.amount) >= 0 ? '+' : ''}${event.amount}`
  if (event.action === 'alterCondition') return `${Number(event.amount) === 1 ? 'add' : 'remove'} ${name}`
  return `set ${event.target} = "${event.property ?? ''}"`
}

function describeRequirement(req, refs) {
  const name = refName(req.target, refs)
  if (req.type === 'stat') return `${name} >= ${req.amount}`
  return Number(req.amount) === 1 ? name : `not ${name}`
}

function describeRule(rule, refs) {
  const name = refName(rule.ref, refs)
  if (rule.ref?.startsWith('condition_')) return Number(rule.value) === 1 ? name : `not ${name}`
  const symbol = { equalto: '=', lessthan: '<', morethan: '>' }[rule.comparator] ?? rule.comparator
  return `${name} ${symbol} ${rule.value}`
}

function refName(id, refs) {
  return refs[id]?.name ? `${refs[id].name}(${id})` : `${id}`
}

function categoryName(tree, id) {
  return (tree.categories ?? []).find(category => category.id === id)?.name ?? id
}

function excerpt(html = '', length = EXCERPT) {
  const text = html
    .replace(/<span\b[^>]*data-key="([^"]*)"[^>]*>[\s\S]*?<\/span>/gi, '{$1}')
    .replace(/<div\b[^>]*data-trama-category[^>]*data-key="([^"]*)"[^>]*>[\s\S]*?<\/div>/gi, '[$1]')
    .replace(/<br\s*\/?>|<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

function fail(message) {
  console.error(message)
  process.exit(1)
}
