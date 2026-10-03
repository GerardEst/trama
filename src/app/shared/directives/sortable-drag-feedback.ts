/** Viewport overlays keep drag feedback independent of list layout and board transforms. */
export class SortableDragFeedback {
  private readonly preview: HTMLDivElement
  private readonly indicator: HTMLDivElement
  private readonly offset: { x: number; y: number }

  constructor(item: HTMLElement, pointer: { x: number; y: number }) {
    const document = item.ownerDocument
    const bounds = item.getBoundingClientRect()
    this.offset = { x: pointer.x - bounds.left, y: pointer.y - bounds.top }
    this.preview = document.createElement('div')
    this.preview.setAttribute('data-sortable-preview', '')
    this.preview.setAttribute('aria-hidden', 'true')
    this.preview.inert = true
    this.preview.style.cssText = 'position: fixed; top: 0; left: 0; pointer-events: none; z-index: 1000; opacity: 0.82;'
    this.preview.style.width = `${bounds.width}px`
    this.preview.style.height = `${bounds.height}px`

    const clone = item.cloneNode(true) as HTMLElement
    // Snapshot computed styles, including inherited theme/font and ancestor selectors.
    // The preview lives outside the transformed board and must look like the original.
    const originals = [item, ...Array.from(item.querySelectorAll<HTMLElement>('*'))]
    const copies = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))]
    originals.forEach((original, index) => {
      const copy = copies[index]
      const style = document.defaultView!.getComputedStyle(original)
      for (let i = 0; i < style.length; i++) {
        const property = style[i]
        copy.style.setProperty(property, style.getPropertyValue(property))
      }
      for (const attribute of Array.from(copy.attributes)) {
        if (attribute.name === 'id' || attribute.name.startsWith('data-board-') || attribute.name.startsWith('data-sortable-')) {
          copy.removeAttribute(attribute.name)
        }
      }
      copy.style.pointerEvents = 'none'
      copy.style.transition = 'none'
      copy.style.animation = 'none'
    })
    const width = item.offsetWidth || bounds.width
    const height = item.offsetHeight || bounds.height
    clone.style.position = 'relative'
    clone.style.inset = 'auto'
    clone.style.margin = '0'
    clone.style.boxSizing = 'border-box'
    clone.style.width = `${width}px`
    clone.style.height = `${height}px`
    clone.style.transformOrigin = 'top left'
    clone.style.transform = `scale(${bounds.width / width}, ${bounds.height / height})`
    clone.style.opacity = '1'
    clone.style.boxShadow = '0 12px 28px rgb(0 0 0 / 0.18)'
    this.preview.append(clone)

    this.indicator = document.createElement('div')
    this.indicator.setAttribute('data-sortable-indicator', '')
    this.indicator.setAttribute('aria-hidden', 'true')
    this.indicator.style.cssText = 'position: fixed; top: 0; left: 0; height: 2px; border-radius: 1px; pointer-events: none; z-index: 1001;'
    this.indicator.style.backgroundColor = document.defaultView!.getComputedStyle(item).getPropertyValue('--polo-color-focus') || 'Highlight'
    this.indicator.hidden = true
    document.body.append(this.preview, this.indicator)
    this.move(pointer)
  }

  move(pointer: { x: number; y: number }) {
    this.preview.style.transform = `translate3d(${pointer.x - this.offset.x}px, ${pointer.y - this.offset.y}px, 0)`
  }

  showInsertion(items: HTMLElement[], target: HTMLElement, after: boolean) {
    const index = items.indexOf(target)
    const bounds = target.getBoundingClientRect()
    const neighbour = items[index + (after ? 1 : -1)]?.getBoundingClientRect()
    // Place a new line in the gap, never on the target's border.
    const gap = neighbour
      ? after ? neighbour.top - bounds.bottom : bounds.top - neighbour.bottom
      : items.length > 1
        ? Math.max(0, items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom)
        : 0
    const y = after ? bounds.bottom + gap / 2 : bounds.top - gap / 2
    this.indicator.style.width = `${bounds.width}px`
    this.indicator.style.transform = `translate3d(${bounds.left}px, ${y - 1}px, 0)`
    this.indicator.hidden = false
  }

  hideInsertion() { this.indicator.hidden = true }

  destroy() {
    this.preview.remove()
    this.indicator.remove()
  }
}
