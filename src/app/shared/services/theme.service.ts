import { Injectable, signal } from '@angular/core'

const THEME_KEY = 'polo-theme'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly systemDark = window.matchMedia('(prefers-color-scheme: dark)')
  private readonly darkState = signal(this.systemDark.matches)
  readonly dark = this.darkState.asReadonly()
  private override: 'dark' | 'light' | null = null

  constructor() {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'dark' || saved === 'light') this.override = saved
    } catch {
      // The system setting still works if storage is unavailable.
    }

    if (this.override) {
      document.documentElement.dataset['poloTheme'] = this.override
      this.darkState.set(this.override === 'dark')
    }

    this.systemDark.addEventListener('change', (event) => {
      if (!this.override) this.darkState.set(event.matches)
    })
  }

  setDark(dark: boolean) {
    this.override = dark ? 'dark' : 'light'
    this.darkState.set(dark)
    document.documentElement.dataset['poloTheme'] = this.override
    try {
      localStorage.setItem(THEME_KEY, this.override)
    } catch {
      // The current page can still switch themes without persistence.
    }
  }
}
