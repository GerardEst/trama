import { TestBed } from '@angular/core/testing'
import { ThemeService } from './theme.service'

describe('ThemeService', () => {
  const key = 'polo-theme'
  let previousTheme: string | null
  let previousAttribute: string | undefined

  beforeEach(() => {
    previousTheme = localStorage.getItem(key)
    previousAttribute = document.documentElement.dataset['poloTheme']
    localStorage.removeItem(key)
    delete document.documentElement.dataset['poloTheme']
  })

  afterEach(() => {
    if (previousTheme === null) localStorage.removeItem(key)
    else localStorage.setItem(key, previousTheme)
    if (previousAttribute) document.documentElement.dataset['poloTheme'] = previousAttribute
    else delete document.documentElement.dataset['poloTheme']
  })

  it('uses the system preference until the user selects a mode', () => {
    const theme = TestBed.inject(ThemeService)
    expect(theme.dark()).toBe(window.matchMedia('(prefers-color-scheme: dark)').matches)
    expect(document.documentElement.dataset['poloTheme']).toBeUndefined()

    theme.setDark(true)
    expect(theme.dark()).toBeTrue()
    expect(document.documentElement.dataset['poloTheme']).toBe('dark')
    expect(localStorage.getItem(key)).toBe('dark')

    theme.setDark(false)
    expect(theme.dark()).toBeFalse()
    expect(document.documentElement.dataset['poloTheme']).toBe('light')
    expect(localStorage.getItem(key)).toBe('light')
  })

  it('restores a saved preference', () => {
    localStorage.setItem(key, 'dark')
    const theme = TestBed.inject(ThemeService)
    expect(theme.dark()).toBeTrue()
    expect(document.documentElement.dataset['poloTheme']).toBe('dark')
  })
})
