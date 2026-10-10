import { DestroyRef, Injectable, signal } from '@angular/core'

@Injectable()
export class BoardAnchorRegistryService {
  private readonly anchors = new Map<string, HTMLElement>()
  private readonly anchorVersion = signal(0)
  private invalidationFrame?: number
  private pendingNodes = new Set<string>()
  private pendingFullRefresh = false
  private changedNodes?: ReadonlySet<string>
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

  /** Undefined means a full refresh, including when a consumer skipped frames. */
  changedNodesSince(version: number): ReadonlySet<string> | undefined {
    return this.anchorVersion() === version + 1 ? this.changedNodes : undefined
  }

  invalidate(nodeIds?: Iterable<string>) {
    if (nodeIds === undefined) this.pendingFullRefresh = true
    else for (const nodeId of nodeIds) this.pendingNodes.add(nodeId)
    if (this.invalidationFrame !== undefined) return

    this.invalidationFrame = requestAnimationFrame(() => {
      this.invalidationFrame = undefined
      this.changedNodes = this.pendingFullRefresh ? undefined : this.pendingNodes
      this.pendingNodes = new Set<string>()
      this.pendingFullRefresh = false
      this.anchorVersion.update((version) => version + 1)
    })
  }
}
