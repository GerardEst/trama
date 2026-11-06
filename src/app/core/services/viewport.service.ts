import { DestroyRef, Injectable, inject, signal } from '@angular/core'
import { MOBILE_LAYOUT_QUERY, isMobileLayout } from '../constants'

/** One app-wide media query listener, shared by every component that adapts to phones. */
@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  readonly mobile = signal(isMobileLayout())

  constructor() {
    const query = typeof window !== 'undefined' ? window.matchMedia?.(MOBILE_LAYOUT_QUERY) : undefined
    if (!query) return
    const update = (event: MediaQueryListEvent) => this.mobile.set(event.matches)
    query.addEventListener('change', update)
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', update))
  }
}
