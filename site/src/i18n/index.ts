import { landing as en, type Copy } from './en'
import { landing as es } from './es'
import { landing as ca } from './ca'
import { docs as docsEn, type DocsCopy } from './docs/en'
import { docs as docsEs } from './docs/es'
import { docs as docsCa } from './docs/ca'
import { pricing as pricingEn, type PricingCopy } from './pricing/en'
import { pricing as pricingEs } from './pricing/es'
import { pricing as pricingCa } from './pricing/ca'
import { useCases as useCasesEn, type UseCasesCopy } from './use-cases/en'
import { useCases as useCasesEs } from './use-cases/es'
import { useCases as useCasesCa } from './use-cases/ca'
import { legal as legalEn, type LegalCopy } from './legal/en'
import { legal as legalEs } from './legal/es'
import { legal as legalCa } from './legal/ca'

export type { Copy, DocsCopy, LegalCopy, PricingCopy, UseCasesCopy }

export const LANGS = ['en', 'es', 'ca'] as const
export type Lang = (typeof LANGS)[number]

const COPY: Record<Lang, Copy> = { en, es, ca }
const DOCS_COPY: Record<Lang, DocsCopy> = { en: docsEn, es: docsEs, ca: docsCa }
const PRICING_COPY: Record<Lang, PricingCopy> = { en: pricingEn, es: pricingEs, ca: pricingCa }
const USE_CASES_COPY: Record<Lang, UseCasesCopy> = { en: useCasesEn, es: useCasesEs, ca: useCasesCa }
const LEGAL_COPY: Record<Lang, LegalCopy> = { en: legalEn, es: legalEs, ca: legalCa }

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

export function pricingCopyFor(lang: Lang): PricingCopy {
  return PRICING_COPY[lang]
}

export function useCasesCopyFor(lang: Lang): UseCasesCopy {
  return USE_CASES_COPY[lang]
}

export function legalCopyFor(lang: Lang): LegalCopy {
  return LEGAL_COPY[lang]
}

export { format } from '../lib/format'
