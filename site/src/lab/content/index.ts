import type { Lang } from '../../i18n'
import { ca } from './ca'
import { en } from './en'
import { es } from './es'
import type { LabCopy } from './types'

export * from './types'

const COPY: Record<Lang, LabCopy> = { en, es, ca }

export function labCopyFor(lang: Lang): LabCopy {
  return COPY[lang]
}
