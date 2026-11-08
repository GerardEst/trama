import { getRelativeLocaleUrl } from 'astro:i18n'
import { LANGS, type Lang } from '../i18n'
import type { PagePath } from './pages'

/** A page in one language: English has no prefix (/docs/features), the rest do (/es/docs/features). */
export function localePath(lang: Lang, page: PagePath = ''): string {
  return getRelativeLocaleUrl(lang, page)
}

/** getStaticPaths for a page under src/pages/[...locale]: one copy per language. */
export function localeStaticPaths() {
  return LANGS.map(lang => ({
    params: { locale: lang === 'en' ? undefined : lang },
    props: { lang },
  }))
}
