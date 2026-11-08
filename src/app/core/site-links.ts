import { environment } from 'src/environments/environment'
import type { Lang } from './i18n/i18n.types'

/**
 * Pages of the public site (site/), which is not part of the app: link to them
 * with plain hrefs, never router links. English pages have no language prefix.
 */
export const SITE_PAGES = {
  home: '',
  features: 'docs/features',
} as const

type SitePage = (typeof SITE_PAGES)[keyof typeof SITE_PAGES]

export function siteUrl(lang: Lang, page: SitePage = SITE_PAGES.home, fragment?: string): string {
  const path = [lang === 'en' ? '' : lang, page].filter(Boolean).join('/')
  return `${environment.siteUrl}/${path}${fragment ? `#${fragment}` : ''}`
}
