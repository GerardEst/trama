export function storyPlainText(html: string = ''): string {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
}
