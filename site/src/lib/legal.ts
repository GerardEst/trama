// Who runs Trama, as the privacy policy and the terms of service identify them
// (LSSI art. 10 and GDPR art. 13). The one place to change these details.
export const OWNER = {
  name: 'Gerard Esteve Busquets',
  nif: '41549796C',
  email: 'gesteve.12@gmail.com',
  /** Postal address. The row is left out while it is null. */
  address: 'Lleida 14, 17455 Caldes de Malavella, Girona, España' as string | null,
}

/** When the legal texts last changed, shown at the top of both pages. */
export const LEGAL_UPDATED = '2026-11-19'

/** Places the legal texts link to with [label](key). */
export type LegalLinks = Record<string, string>

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => ESCAPES[char])
}

/**
 * A paragraph of the legal copy as HTML: the text is escaped, `[label](key)`
 * becomes a link to `links[key]`, `{owner}` the owner's name and `{email}` a
 * mailto link to the owner.
 * An unknown key fails the build instead of shipping a broken link.
 */
export function legalHtml(text: string, links: LegalLinks): string {
  const mail = `<a href="mailto:${OWNER.email}">${OWNER.email}</a>`
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((\w+)\)/g, (_, label: string, key: string) => {
      const href = links[key]
      if (!href) throw new Error(`Legal copy links to an unknown page: ${key}`)
      const external = /^https?:/.test(href) ? ' rel="noopener"' : ''
      return `<a href="${escapeHtml(href)}"${external}>${label}</a>`
    })
    .replace(/\{owner\}/g, escapeHtml(OWNER.name))
    .replace(/\{email\}/g, mail)
}
