import { TestBed } from '@angular/core/testing'
import { I18nService } from './i18n.service'
import { en } from './en'
import { es } from './es'
import { ca } from './ca'

describe('I18nService', () => {
  const key = 'polo-lang'
  let previousLang: string | null
  let previousHtmlLang: string

  const withBrowserLanguages = (languages: string[]) =>
    spyOnProperty(navigator, 'languages').and.returnValue(languages)

  beforeEach(() => {
    previousLang = localStorage.getItem(key)
    previousHtmlLang = document.documentElement.lang
    localStorage.removeItem(key)
  })

  afterEach(() => {
    if (previousLang === null) localStorage.removeItem(key)
    else localStorage.setItem(key, previousLang)
    document.documentElement.lang = previousHtmlLang
  })

  it('detects Catalan and Spanish browsers, including regional variants', async () => {
    withBrowserLanguages(['ca-ES-valencia', 'es'])
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    expect(i18n.lang()).toBe('ca')
    expect(document.documentElement.lang).toBe('ca')
    expect(i18n.t('common.cancel')).toBe('Cancel·la')
  })

  it('says how long ago something happened during a week, and the date after that', async () => {
    withBrowserLanguages(['en-US'])
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    const now = Date.parse('2026-11-19T12:00:00Z')
    const ago = (seconds: number) => new Date(now - seconds * 1000)
    expect(i18n.formatRelative(ago(20), now)).toBe('this minute')
    expect(i18n.formatRelative(ago(5 * 60), now)).toBe('5 minutes ago')
    expect(i18n.formatRelative(ago(2 * 3600), now)).toBe('2 hours ago')
    expect(i18n.formatRelative(ago(86400), now)).toBe('yesterday')
    expect(i18n.formatRelative(ago(10 * 86400), now)).toBe('Nov 9, 2026')
  })

  it('falls back to English for unsupported browser languages', async () => {
    withBrowserLanguages(['fr-FR', 'de'])
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    expect(i18n.lang()).toBe('en')
    expect(i18n.t('common.cancel')).toBe('Cancel')
  })

  it('prefers the saved choice over the browser language', async () => {
    withBrowserLanguages(['ca'])
    localStorage.setItem(key, 'es')
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    expect(i18n.lang()).toBe('es')
  })

  it('remembers explicit choices, but not languages applied for a single visit', async () => {
    const i18n = TestBed.inject(I18nService)
    await i18n.setLang('es', { persist: false })
    expect(localStorage.getItem(key)).toBeNull()
    await i18n.setLang('ca')
    expect(localStorage.getItem(key)).toBe('ca')
  })

  it('interpolates parameters and formats numbers for the active language', async () => {
    const i18n = TestBed.inject(I18nService)
    await i18n.setLang('es', { persist: false })
    expect(i18n.t('board.route.title', { number: 2 })).toBe('Ruta 2')
    expect(i18n.formatNumber(5.95, { minimumFractionDigits: 2 })).toBe('5,95')
  })

  it('keeps working when storage is blocked', async () => {
    spyOn(localStorage, 'getItem').and.throwError('blocked')
    spyOn(localStorage, 'setItem').and.throwError('blocked')
    withBrowserLanguages(['es'])
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    await i18n.setLang('ca')
    expect(i18n.lang()).toBe('ca')
  })
})

describe('Translations', () => {
  const leaves = (dictionary: object, prefix = ''): [string, string][] =>
    Object.entries(dictionary).flatMap(([name, value]) =>
      typeof value === 'string'
        ? [[prefix + name, value]]
        : leaves(value, `${prefix}${name}.`)
    )
  const english = new Map(leaves(en))
  const placeholders = (value: string) => (value.match(/\{\w+\}/g) ?? []).sort()

  // Words that are spelled the same in English, or deliberately left empty by the grammar.
  const sameAsEnglish = new Set([
    'dashboard.paywall.upgradeEnd',
    'board.groups.nodes',
    'board.frames.nodes',
    'dashboard.home.pro', 'dashboard.story.general', 'dashboard.story.generalTitle',
    // Key combinations and the board's own words that the languages share.
    'dashboard.controls.createShort', 'dashboard.shortcuts.zoom', 'dashboard.shortcuts.helpKeys',
    'dashboard.shortcuts.duplicateKeys', 'dashboard.shortcuts.imageKeys', 'dashboard.shortcuts.groupKeys',
    'dashboard.shortcuts.frameKeys', 'dashboard.shortcuts.panelKeys',
    // The plan's own name, and a plain no in a statistics table.
    'settings.billing.creator', 'dashboard.statistics.no',
    // A minute is abbreviated alike in the three languages.
    'dashboard.overview.learnTime',
  ])

  for (const [lang, dictionary] of Object.entries({ es, ca })) {
    it(`gives every ${lang} string the same placeholders as English and a real translation`, () => {
      for (const [key, value] of leaves(dictionary)) {
        const source = english.get(key) ?? ''
        expect(placeholders(value))
          .withContext(`${lang} ${key}`)
          .toEqual(placeholders(source))
        if (sameAsEnglish.has(key)) continue
        expect(value.trim()).withContext(`${lang} ${key} is empty`).not.toBe('')
        expect(value)
          .withContext(`${lang} ${key} is untranslated`)
          .not.toBe(source)
      }
    })
  }
})
