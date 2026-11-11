import { ATLAS, ATLAS_CHAPTERS, COMPARISON_CHECKED, COMPETITORS, COMPETITOR_NAMES, COMPETITOR_SOURCES, ROWS, atlasFor } from './index'

const SITE = 'https://trama.app'

/** Absolute link to where a capability is documented, if anywhere. */
export function documentation(info: (typeof ATLAS)[number], docsPath: string): string | undefined {
  if (info.docs) return `${docsPath}#${info.docs}`
  return info.reference
}

/**
 * The whole page as plain text, for AI assistants and crawlers. It is built from
 * the same copy as the page, so it cannot say anything the page does not.
 */
export function fullSummary(): string {
  const c = atlasFor('en')
  const lines: string[] = [
    '# Trama',
    '',
    `> ${c.meta.definition}`,
    '',
    `Website: ${SITE}. Comparison checked on ${COMPARISON_CHECKED}.`,
    '',
    '## Facts',
    '',
    ...c.facts.map(fact => `- ${fact.label}: ${fact.value}`),
    '',
    '## Capabilities',
  ]
  for (const chapter of ATLAS_CHAPTERS) {
    lines.push('', `### ${c.chapters[chapter].name}: ${c.chapters[chapter].title}`, '')
    for (const info of ATLAS.filter(item => item.chapter === chapter)) {
      const feature = c.features[info.id]
      const link = documentation(info, `${SITE}/docs/features`)
      lines.push(`- **${feature.name}.** ${feature.question} ${feature.answer} Example: ${feature.example}${link ? ` Docs: ${link}` : ''}`)
    }
  }
  lines.push('', '## Compared with other tools', '')
  lines.push(`| Criterion | Trama | ${COMPETITORS.map(id => COMPETITOR_NAMES[id]).join(' | ')} |`)
  lines.push(`| --- | --- | ${COMPETITORS.map(() => '---').join(' | ')} |`)
  for (const row of ROWS) {
    const cells = c.rows[row]
    lines.push(`| ${cells.label} | ${cells.trama} | ${COMPETITORS.map(id => cells[id]).join(' | ')} |`)
  }
  lines.push('', c.ui.compareLegend, '', '### Where Trama stands out', '')
  lines.push(...c.wins.map(win => `- ${win.title}: ${win.body}`))
  lines.push('', '### Sources', '')
  lines.push(...COMPETITORS.flatMap(id => COMPETITOR_SOURCES[id].map(url => `- ${COMPETITOR_NAMES[id]}: ${url}`)))
  lines.push('', '## Frequently asked questions', '')
  for (const item of c.faq) lines.push(`**${item.question}**`, item.answer, '')
  lines.push('## Links', '')
  lines.push(`- Documentation: ${SITE}/docs/features (also /es/docs/features and /ca/docs/features)`)
  lines.push(`- Index for AI assistants: ${SITE}/llms.txt`)
  lines.push('- Engine on npm: https://www.npmjs.com/package/@trama-app/engine')
  lines.push('- Source code: https://github.com/GerardEst/trama')
  lines.push('')
  return lines.join('\n')
}
