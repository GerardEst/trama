import { landing as en, type Copy } from './en'
import { landing as es } from './es'
import { landing as ca } from './ca'

export type { Copy }

export const LANGS = ['en', 'es', 'ca'] as const
export type Lang = (typeof LANGS)[number]

const COPY: Record<Lang, Copy> = { en, es, ca }

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

export { format } from '../lib/format'
