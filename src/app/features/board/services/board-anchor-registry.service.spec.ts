import { TestBed, fakeAsync, tick } from '@angular/core/testing'
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

  it('merges partial invalidations and resets the moved nodes each frame', fakeAsync(() => {
    TestBed.configureTestingModule({ providers: [BoardAnchorRegistryService] })
    const registry = TestBed.inject(BoardAnchorRegistryService)
    registry.invalidate(['first'])
    registry.invalidate(['second', 'first'])
    tick(16)
    expect([...registry.changedNodesSince(0)!]).toEqual(['first', 'second'])

    registry.invalidate(['third'])
    tick(16)
    expect([...registry.changedNodesSince(1)!]).toEqual(['third'])
    // A consumer that missed a frame must not reuse stale positions.
    expect(registry.changedNodesSince(0)).toBeUndefined()
  }))

  it('lets a full refresh supersede partial requests in either order', fakeAsync(() => {
    TestBed.configureTestingModule({ providers: [BoardAnchorRegistryService] })
    const registry = TestBed.inject(BoardAnchorRegistryService)
    registry.invalidate(['first'])
    registry.invalidate()
    tick(16)
    expect(registry.changedNodesSince(0)).toBeUndefined()

    registry.invalidate()
    registry.invalidate(['second'])
    tick(16)
    expect(registry.changedNodesSince(1)).toBeUndefined()
  }))
})
