import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core'
import { BoardAnchorRegistryService } from '../services/board-anchor-registry.service'

@Directive({
  selector: '[poloBoardAnchor]',
  standalone: true,
})
export class BoardAnchorDirective implements OnInit, OnDestroy {
  private anchorId = ''
  private initialized = false

  @Input({ required: true })
  set poloBoardAnchor(anchorId: string) {
    if (anchorId === this.anchorId) return

    if (this.initialized && this.anchorId) {
      this.registry.unregister(this.anchorId, this.elementRef.nativeElement)
    }

    this.anchorId = anchorId
    if (this.initialized && this.anchorId) {
      this.registry.register(this.anchorId, this.elementRef.nativeElement)
    }
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private registry: BoardAnchorRegistryService
  ) {}

  ngOnInit() {
    this.initialized = true
    if (this.anchorId) {
      this.registry.register(this.anchorId, this.elementRef.nativeElement)
    }
  }

  ngOnDestroy() {
    if (this.anchorId) {
      this.registry.unregister(this.anchorId, this.elementRef.nativeElement)
    }
  }
}
