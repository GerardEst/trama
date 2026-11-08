import type { APIRoute } from 'astro'
import { LANGS } from '../i18n'
import { localePath } from '../lib/locale'
import { PAGES } from '../lib/pages'

// Every page in every language, each listing its translations (robots.txt points here).
export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).href
  const entries = Object.values(PAGES).flatMap(page => {
    const alternates = [
      ...LANGS.map(lang => ({ hreflang: lang, href: url(localePath(lang, page)) })),
      { hreflang: 'x-default', href: url(localePath('en', page)) },
    ]
      .map(link => `    <xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${link.href}" />`)
      .join('\n')
    return LANGS.map(lang => `  <url>\n    <loc>${url(localePath(lang, page))}</loc>\n${alternates}\n  </url>`)
  })
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
