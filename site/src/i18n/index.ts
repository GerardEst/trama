import { landing as en, type Copy } from './en'
import { landing as es } from './es'
import { landing as ca } from './ca'
import { docs as docsEn, type DocsCopy } from './docs/en'
import { docs as docsEs } from './docs/es'
import { docs as docsCa } from './docs/ca'

export type { Copy, DocsCopy }

export const LANGS = ['en', 'es', 'ca'] as const
export type Lang = (typeof LANGS)[number]

const COPY: Record<Lang, Copy> = { en, es, ca }
const DOCS_COPY: Record<Lang, DocsCopy> = { en: docsEn, es: docsEs, ca: docsCa }

// Language names stay in their own language so everybody can find theirs.
export const LANGUAGE_NAMES: Record<Lang, { code: string; name: string }> = {
  en: { code: 'EN', name: 'English' },
  es: { code: 'ES', name: 'Español' },
  ca: { code: 'CA', name: 'Català' },
}

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

export function copyFor(lang: Lang): Copy {
  return COPY[lang]
}

export function docsCopyFor(lang: Lang): DocsCopy {
  return DOCS_COPY[lang]
}

export { format } from '../lib/format'
