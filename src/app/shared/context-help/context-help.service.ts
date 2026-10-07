import { Injectable, signal } from '@angular/core'

const STORAGE_KEY = 'polo-context-help'

@Injectable({ providedIn: 'root' })
export class ContextHelpService {
  private readonly enabledState = signal(this.savedPreference())
  private readonly activeState = signal<string | null>(null)
  readonly enabled = this.enabledState.asReadonly()
  readonly activeId = this.activeState.asReadonly()

  setEnabled(enabled: boolean) {
    this.enabledState.set(enabled)
    if (!enabled) this.activeState.set(null)
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      // Help still works for this visit when browser storage is unavailable.
    }
  }

  open(id: string) {
    if (this.enabled()) this.activeState.set(id)
  }

  close(id: string) {
    if (this.activeId() === id) this.activeState.set(null)
  }

  private savedPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false'
    } catch {
      return true
    }
  }
}
