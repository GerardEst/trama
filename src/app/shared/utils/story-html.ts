// Answer buttons allow phrasing content, not paragraph elements.
export function storyInlineHtml(html: string = ''): string {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const parts = Array.from(document.body.children)
  return parts.length && parts.every(element => element.tagName === 'P')
    ? parts.map(element => element.innerHTML).join('<br>')
    : html
}

export function storyPlainText(html: string = ''): string {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
}
