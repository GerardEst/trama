import type { en } from './en'

export const LANGS = ['en', 'es', 'ca'] as const
export type Lang = (typeof LANGS)[number]

// Each language must provide exactly the same keys as the English source.
export type Dictionary = typeof en

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]

export type TranslationKey = Leaves<Dictionary>

export type TranslationParams = Record<string, string | number>

export function isLang(value: unknown): value is Lang {
  return (
    typeof value === 'string' && (LANGS as readonly string[]).includes(value)
  )
}
