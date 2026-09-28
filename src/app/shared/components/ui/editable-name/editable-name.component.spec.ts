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
