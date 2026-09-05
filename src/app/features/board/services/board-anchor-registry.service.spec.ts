import { TestBed } from '@angular/core/testing'
import { BoardAnchorRegistryService } from './board-anchor-registry.service'

describe('BoardAnchorRegistryService', () => {
  it('coalesces anchor and explicit invalidations into one animation frame', () => {
    let refresh: FrameRequestCallback | undefined
    const animationFrame = spyOn(window, 'requestAnimationFrame').and.callFake(
      (callback) => {
        refresh = callback
        return 1
      }
    )
    TestBed.configureTestingModule({
      providers: [BoardAnchorRegistryService],
    })
    const registry = TestBed.inject(BoardAnchorRegistryService)

    registry.register('first', document.createElement('div'))
    registry.register('second', document.createElement('div'))
    registry.invalidate()

    expect(animationFrame).toHaveBeenCalledTimes(1)
    expect(registry.version()).toBe(0)

    refresh?.(0)

    expect(registry.version()).toBe(1)
  })
})
