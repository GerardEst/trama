import { NgZone } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EditableNameComponent } from './editable-name.component'

describe('EditableNameComponent', () => {
  let fixture: ComponentFixture<EditableNameComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [EditableNameComponent] })
    fixture = TestBed.createComponent(EditableNameComponent)
    fixture.componentRef.setInput('label', 'Story name')
    fixture.componentRef.setInput('value', 'Chapter one')
    fixture.detectChanges()
  })

  it('shows the name and emits edits without propagating pointerdown to a drag handle', () => {
    const host = fixture.nativeElement as HTMLElement
    const input = host.querySelector('input')!
    expect(input.value).toBe('Chapter one')
    expect(input.getAttribute('aria-label')).toBe('Story name')
    const changed = jasmine.createSpy('changed')
    fixture.componentInstance.valueChanged.subscribe(changed)
    const pointerDown = jasmine.createSpy('pointerDown')
    host.addEventListener('pointerdown', pointerDown)
    input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(pointerDown).not.toHaveBeenCalled()
    for (const eventName of ['mousedown', 'dblclick']) {
      const propagated = jasmine.createSpy(eventName)
      host.addEventListener(eventName, propagated)
      input.dispatchEvent(new MouseEvent(eventName, { bubbles: true }))
      expect(propagated).not.toHaveBeenCalled()
    }

    input.value = 'Chapter two'
    input.dispatchEvent(new Event('change'))
    expect(changed).toHaveBeenCalledOnceWith('Chapter two')
  })

  it('lets an unfocused name start a header drag, but edits on a click', () => {
    fixture.componentRef.setInput('dragHandle', true)
    fixture.detectChanges()
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!
    const header = document.createElement('div')
    header.appendChild(fixture.nativeElement)
    document.body.appendChild(header)
    const down = jasmine.createSpy('down')
    header.addEventListener('mousedown', down)
    try {
      input.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, pointerId: 1, clientX: 10, clientY: 10,
      }))
      const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      input.dispatchEvent(mouseDown)
      expect(mouseDown.defaultPrevented).toBeTrue()
      expect(down).toHaveBeenCalledTimes(1)
      expect(input.readOnly).toBeTrue()

      document.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true, pointerId: 1, clientX: 30, clientY: 10,
      }))
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      fixture.detectChanges()
      expect(input.readOnly).toBeTrue()
      expect(document.activeElement).not.toBe(input)

      input.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, pointerId: 2, clientX: 10, clientY: 10,
      }))
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      fixture.detectChanges()
      expect(document.activeElement).toBe(input)
      expect(input.readOnly).toBeFalse()
      input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      expect(down).toHaveBeenCalledTimes(1)
    } finally {
      input.blur()
      header.remove()
    }
  })

  it('does not run change detection for document pointer moves, pressed or not', () => {
    fixture.componentRef.setInput('dragHandle', true)
    fixture.detectChanges()
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!
    let turns = 0
    const subscription = TestBed.inject(NgZone).onMicrotaskEmpty.subscribe(() => turns++)
    const move = (pointerId: number) => document.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerId, clientX: 30, clientY: 10,
    }))
    try {
      move(1)
      expect(turns).toBe(0)

      input.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, pointerId: 1, clientX: 10, clientY: 10,
      }))
      turns = 0
      move(1)
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }))
      move(1)
      expect(turns).toBe(0)
    } finally {
      subscription.unsubscribe()
    }
  })

  it('has no visible border until focused, including in the dark dashboard theme', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!
    const previousTheme = document.documentElement.getAttribute('data-polo-theme')
    const dashboard = document.createElement('polo-dashboard')
    document.body.appendChild(dashboard)
    dashboard.appendChild(fixture.nativeElement)
    document.documentElement.setAttribute('data-polo-theme', 'dark')

    try {
      expect(getComputedStyle(input).borderTopColor).toBe('rgba(0, 0, 0, 0)')
      expect(getComputedStyle(input).fontFamily).toContain('Raleway')
      input.focus()
      expect(getComputedStyle(input).borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    } finally {
      input.blur()
      dashboard.remove()
      if (previousTheme === null) document.documentElement.removeAttribute('data-polo-theme')
      else document.documentElement.setAttribute('data-polo-theme', previousTheme)
    }
  })
})
