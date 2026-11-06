import { fakeAsync, tick } from '@angular/core/testing'
import { LongPress } from './long-press'

const pointer = (type: string, init: PointerEventInit = {}) => new PointerEvent(type, {
  pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: 50, clientY: 50, ...init,
})

describe('LongPress', () => {
  let fired: jasmine.Spy
  let press: LongPress

  beforeEach(() => {
    fired = jasmine.createSpy('fired')
    press = new LongPress(fired)
  })

  it('fires once after a touch is held still', fakeAsync(() => {
    const down = pointer('pointerdown')
    press.down(down)
    press.move(pointer('pointermove', { clientX: 55, clientY: 53 }))
    tick(499)
    expect(fired).not.toHaveBeenCalled()
    tick(1)
    expect(fired).toHaveBeenCalledOnceWith(down)
    tick(1000)
    expect(fired).toHaveBeenCalledTimes(1)
  }))

  it('ignores a finger that pans, lifts early, a second finger and the mouse', fakeAsync(() => {
    press.down(pointer('pointerdown'))
    press.move(pointer('pointermove', { clientX: 70 }))
    tick(600)

    press.down(pointer('pointerdown'))
    tick(200)
    press.cancel()
    tick(600)

    press.down(pointer('pointerdown'))
    press.down(pointer('pointerdown', { pointerId: 2, isPrimary: false }))
    tick(600)

    press.down(pointer('pointerdown', { pointerType: 'mouse' }))
    tick(600)
    expect(fired).not.toHaveBeenCalled()
  }))

  it('ignores movement of another pointer', fakeAsync(() => {
    press.down(pointer('pointerdown'))
    press.move(pointer('pointermove', { pointerId: 2, clientX: 200 }))
    tick(500)
    expect(fired).toHaveBeenCalledTimes(1)
  }))
})
