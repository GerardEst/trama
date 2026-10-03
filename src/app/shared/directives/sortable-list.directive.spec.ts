import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { SortableListDirective, SortableMove } from './sortable-list.directive'

@Component({
  standalone: true,
  imports: [SortableListDirective],
  template: `<div poloSortableList (sorted)="moves.push($event)" (sorting)="states.push($event)">
    @for (id of ids; track id) {
      <div [attr.data-sortable-id]="id"><button data-sortable-handle>Move</button><input /></div>
    }
  </div>`,
})
class HostComponent {
  ids = ['a', 'b', 'c']
  moves: SortableMove[] = []
  states: boolean[] = []
}

describe('SortableListDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    const list = fixture.debugElement.query(By.directive(SortableListDirective))
    const element = list.nativeElement as HTMLElement
    const directive = list.injector.get(SortableListDirective)
    spyOn(element, 'setPointerCapture')
    spyOn(element, 'hasPointerCapture').and.returnValue(true)
    spyOn(element, 'releasePointerCapture')
    const items = Array.from(element.children) as HTMLElement[]
    // Scaled viewport geometry: no unscaled offsets should enter the calculation.
    spyOn(element, 'getBoundingClientRect').and.returnValue(new DOMRect(100, 50, 200, 180))
    items.forEach((item, i) => spyOn(item, 'getBoundingClientRect').and.returnValue(new DOMRect(100, 50 + i * 60, 200, 50)))
    function pointer(type: string, y: number, target: HTMLElement = element, pointerId = 1) {
      target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, isPrimary: true, pointerId, button: 0, clientX: 150, clientY: y }))
    }
    return { fixture, element, directive, items, pointer, host: fixture.componentInstance }
  }

  it('drops at the final index, marks the insertion and does not mutate the input', () => {
    const { host, items, pointer, element } = setup()
    pointer('pointerdown', 70, items[0].querySelector('button')!)
    pointer('pointermove', 215)
    const preview = document.querySelector<HTMLElement>('[data-sortable-preview]')!
    const indicator = document.querySelector<HTMLElement>('[data-sortable-indicator]')!
    expect(preview.inert).toBeTrue()
    expect(preview.getAttribute('aria-hidden')).toBe('true')
    expect(preview.style.pointerEvents).toBe('none')
    expect(preview.style.transform).toBe('translate3d(100px, 195px, 0px)')
    expect(indicator.parentElement).toBe(document.body)
    expect(indicator.hidden).toBeFalse()
    expect(indicator.style.transform).toBe('translate3d(100px, 224px, 0px)')
    expect(indicator.style.width).toBe('200px')
    expect(items.some(item => item.hasAttribute('data-sortable-drop'))).toBeFalse()
    expect(host.moves).toEqual([])
    pointer('pointerup', 215)
    expect(host.moves).toEqual([{ id: 'a', toIndex: 2 }])
    expect(host.ids).toEqual(['a', 'b', 'c'])
    expect(host.states).toEqual([true, false])
    expect(element.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(items[0].hasAttribute('data-sortable-dragging')).toBeFalse()
    expect(document.querySelector('[data-sortable-preview]')).toBeNull()
    expect(document.querySelector('[data-sortable-indicator]')).toBeNull()
  })

  it('places the insertion line in the gap between two answers', () => {
    const { fixture, items, pointer } = setup()
    pointer('pointerdown', 190, items[2].querySelector('button')!)
    pointer('pointermove', 130)
    const indicator = document.querySelector<HTMLElement>('[data-sortable-indicator]')!
    expect(indicator.style.transform).toBe('translate3d(100px, 104px, 0px)')
    expect(indicator.style.height).toBe('2px')
    expect(items[0].getBoundingClientRect().bottom).toBe(100)
    expect(items[1].getBoundingClientRect().top).toBe(110)
    fixture.destroy()
  })

  it('creates the ghost only after the threshold and follows horizontal movement too', () => {
    const { fixture, element, items, pointer } = setup()
    pointer('pointerdown', 70, items[0].querySelector('button')!)
    pointer('pointermove', 72)
    expect(document.querySelector('[data-sortable-preview]')).toBeNull()
    element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 180, clientY: 70 }))
    const preview = document.querySelector<HTMLElement>('[data-sortable-preview]')!
    expect(preview.style.transform).toBe('translate3d(130px, 50px, 0px)')
    expect(document.querySelector<HTMLElement>('[data-sortable-indicator]')!.hidden).toBeTrue()
    fixture.destroy()
  })

  it('cancels with Escape, pointercancel, lost capture or an outside drop', () => {
    for (const reason of ['Escape', 'pointercancel', 'lostpointercapture', 'outside']) {
      const { host, items, pointer, element, fixture } = setup()
      pointer('pointerdown', 70, items[0].querySelector('button')!)
      pointer('pointermove', 215)
      if (reason === 'Escape') element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      else if (reason === 'outside') pointer('pointerup', 250)
      else pointer(reason, 215)
      expect(host.moves).withContext(reason).toEqual([])
      expect(host.states).toEqual([true, false])
      expect(document.querySelector('[data-sortable-preview]')).toBeNull()
      expect(document.querySelector('[data-sortable-indicator]')).toBeNull()
      fixture.destroy()
    }
  })

  it('ignores editor gestures, clicks, other pointers and boundary keyboard moves', () => {
    const { host, items, pointer } = setup()
    pointer('pointerdown', 70, items[0].querySelector('input')!)
    expect(host.states).toEqual([])
    const handle = items[0].querySelector('button')!
    pointer('pointerdown', 70, handle)
    pointer('pointermove', 190, undefined, 2)
    pointer('pointerup', 70)
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(host.moves).toEqual([])
  })

  it('supports arrow keys, Home and End only from the handle', () => {
    const { host, items } = setup()
    const handle = items[1].querySelector('button')!
    for (const key of ['ArrowUp', 'ArrowDown', 'Home', 'End']) {
      handle.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    }
    expect(host.moves.map(move => move.toIndex)).toEqual([0, 2, 0, 2])
    items[1].querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(host.moves.length).toBe(4)
  })

  it('shows an independent line before the first item and removes cloned identities', () => {
    const { fixture, items, pointer } = setup()
    items[2].id = 'source-item'
    items[2].setAttribute('data-board-origin', 'answer-c')
    pointer('pointerdown', 190, items[2].querySelector('button')!)
    pointer('pointermove', 70)
    const preview = document.querySelector('[data-sortable-preview]')!
    expect(preview.querySelector('[id], [data-sortable-id], [data-board-origin]')).toBeNull()
    expect(document.querySelector<HTMLElement>('[data-sortable-indicator]')!.style.transform).toBe('translate3d(100px, 44px, 0px)')
    fixture.destroy()
  })

  it('releases capture, overlays and sorting state when destroyed mid-gesture', () => {
    const { fixture, host, items, pointer } = setup()
    pointer('pointerdown', 70, items[0].querySelector('button')!)
    pointer('pointermove', 215)
    fixture.destroy()
    expect(host.states).toEqual([true, false])
    expect(host.moves).toEqual([])
    expect(document.querySelector('[data-sortable-preview]')).toBeNull()
    expect(document.querySelector('[data-sortable-indicator]')).toBeNull()
  })
})
