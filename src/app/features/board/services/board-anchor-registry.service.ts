import { DestroyRef, Injectable, signal } from '@angular/core'

@Injectable()
export class BoardAnchorRegistryService {
  private readonly anchors = new Map<string, HTMLElement>()
  private readonly anchorVersion = signal(0)
  private invalidationFrame?: number
  private readonly resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => this.invalidate())

  readonly version = this.anchorVersion.asReadonly()

  constructor(destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect()
      if (this.invalidationFrame !== undefined) {
        cancelAnimationFrame(this.invalidationFrame)
      }
    })
  }

  register(id: string, element: HTMLElement) {
    this.anchors.set(id, element)
    this.resizeObserver?.observe(element)
    this.invalidate()
  }

  unregister(id: string, element: HTMLElement) {
    if (this.anchors.get(id) !== element) return

    this.anchors.delete(id)
    this.resizeObserver?.unobserve(element)
    this.invalidate()
  }

  get(id: string) {
    return this.anchors.get(id)
  }

  invalidate() {
    if (this.invalidationFrame !== undefined) return

    this.invalidationFrame = requestAnimationFrame(() => {
      this.invalidationFrame = undefined
      this.anchorVersion.update((version) => version + 1)
    })
  }
}
