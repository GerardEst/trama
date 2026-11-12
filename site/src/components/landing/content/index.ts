import type { Lang } from '../../../i18n'
import { ca } from './ca'
import { en } from './en'
import { es } from './es'
import type { LandingCopy } from './types'

export * from './types'

const COPY: Record<Lang, LandingCopy> = { en, es, ca }

export function landingCopyFor(lang: Lang): LandingCopy {
  return COPY[lang]
}
