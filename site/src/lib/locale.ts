import { getRelativeLocaleUrl } from 'astro:i18n'
import type { Lang } from '../i18n'

/** The landing page of each language: /, /es and /ca. */
export function localePath(lang: Lang): string {
  return getRelativeLocaleUrl(lang)
}
