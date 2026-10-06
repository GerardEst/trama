import type { Editor } from '@tiptap/core'
import type { ref } from 'src/app/core/interfaces/interfaces'

// An emptied editor still returns '<p></p>'; store it as empty so placeholders and
// "has text" checks treat it as blank.
export function storyEditorValue(editor: Editor): string {
  return editor.isEmpty ? '' : editor.getHTML()
}

// A few authoring fields can still contain text written before rich-text editing.
// Interpret their literal newlines as hard breaks instead of letting HTML parsing collapse them.
export function storyEditorHtml(text: string, refs: Record<string, ref> = {}): string {
  if (!text) return text
  if (/^\s*<(?:p|h[1-6]|ul|ol|blockquote|pre|div)\b/i.test(text)) {
    if (!/[\r\n]/.test(text)) return text
    const document = new DOMParser().parseFromString(text, 'text/html')
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const lineBreaks: Text[] = []
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      const parent = node.parentElement
      if (/[\r\n]/.test(node.data) && parent?.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote') &&
        !parent.closest('pre, code, [data-trama-variable], [data-trama-category]')) {
        lineBreaks.push(node)
      }
    }
    for (const node of lineBreaks) {
      const fragment = document.createDocumentFragment()
      node.data.split(/\r\n?|\n/).forEach((part, index) => {
        if (index) fragment.append(document.createElement('br'))
        fragment.append(document.createTextNode(part))
      })
      node.replaceWith(fragment)
    }
    return document.body.innerHTML
  }

  const escaped = text.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] ?? char)
  // Plain legacy tokens must become explicit rich-text tokens on correction.
  // Ordinary #text already authored as HTML remains literal (handled above).
  const withVariables = escaped.replace(/#([a-zA-Z0-9_]+)/g, (_match, key: string) => {
    const kind = refs[key]?.type ?? (key.startsWith('stat_') ? 'stat' : key.startsWith('condition_') ? 'condition' : 'property')
    return `<span data-trama-variable="" data-kind="${kind}" data-key="${key}">#${key}</span>`
  })
  return withVariables.split(/(\[[a-zA-Z0-9_]+\])/g).map(part => {
    if (!part) return ''
    if (/^\[[a-zA-Z0-9_]+\]$/.test(part)) {
      return `<div data-trama-category="" data-key="${part.slice(1, -1)}">${part}</div>`
    }
    return `<p>${part.replace(/\r\n?|\n/g, '<br>')}</p>`
  }).join('')
}
