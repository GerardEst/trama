// Colours the engine example: keywords, strings, comments and called functions.
// Escapes first, so text from the reader's own story link can never become markup.
// No token spans a line, so wrapping each line afterwards keeps the markup valid.
const TOKENS = /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*')|\b(import|from|const|let|await|async|if|return|new)\b|\b([A-Za-z_$][\w$]*)(?=\()/g
const CLASSES = ['tk-c', 'tk-s', 'tk-k', 'tk-f']

export function highlightCode(code: string): string {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const coloured = escaped.replace(TOKENS, (match, ...groups: (string | undefined)[]) => {
    const index = groups.slice(0, 4).findIndex(group => group !== undefined)
    return `<span class="${CLASSES[index]}">${match}</span>`
  })
  // One span per line, so a direction can number the listing with a CSS counter.
  return coloured
    .split('\n')
    .map(line => `<span class="tk-line">${line}</span>`)
    .join('\n')
}
