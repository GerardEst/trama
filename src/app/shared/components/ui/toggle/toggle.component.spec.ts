import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ToggleComponent } from './toggle.component'

describe('ToggleComponent', () => {
  let component: ToggleComponent
  let fixture: ComponentFixture<ToggleComponent>
  let button: HTMLButtonElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ToggleComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('label', 'Dark mode')
    fixture.detectChanges()
    button = fixture.nativeElement.querySelector('button')
  })

  it('renders an accessible, unchecked switch with a visible label', () => {
    expect(button.type).toBe('button')
    expect(button.getAttribute('role')).toBe('switch')
    expect(button.getAttribute('aria-label')).toBe('Dark mode')
    expect(button.getAttribute('aria-checked')).toBe('false')
    expect(button.textContent).toContain('Dark mode')
    expect(button.disabled).toBeFalse()
  })

  it('toggles in both directions and emits the new checked state', () => {
    const changed = spyOn(component.checkedChange, 'emit')
    button.click()
    fixture.detectChanges()
    expect(component.checked).toBeTrue()
    expect(button.getAttribute('aria-checked')).toBe('true')
    expect(button.classList.contains('toggle--checked')).toBeTrue()
    expect(changed).toHaveBeenCalledOnceWith(true)

    button.click()
    fixture.detectChanges()
    expect(component.checked).toBeFalse()
    expect(button.getAttribute('aria-checked')).toBe('false')
    expect(button.getAttribute('aria-label')).toBe('Dark mode')
    expect(changed.calls.allArgs()).toEqual([[true], [false]])
  })

  it('does not change or emit when disabled, including direct calls', () => {
    fixture.componentRef.setInput('disabled', true)
    fixture.componentRef.setInput('checked', true)
    fixture.detectChanges()
    const changed = spyOn(component.checkedChange, 'emit')

    expect(button.disabled).toBeTrue()
    button.click()
    component.toggle()

    expect(component.checked).toBeTrue()
    expect(changed).not.toHaveBeenCalled()
  })

  it('reflects checked changes from its parent without emitting', () => {
    const changed = spyOn(component.checkedChange, 'emit')
    fixture.componentRef.setInput('checked', true)
    fixture.detectChanges()
    expect(button.getAttribute('aria-checked')).toBe('true')

    fixture.componentRef.setInput('checked', false)
    fixture.detectChanges()
    expect(button.getAttribute('aria-checked')).toBe('false')
    expect(changed).not.toHaveBeenCalled()
  })

  it('retains its accessible name when the visible label is hidden', () => {
    fixture.componentRef.setInput('hideLabel', true)
    fixture.detectChanges()
    expect(button.querySelector('.toggle__label')).toBeNull()
    expect(button.getAttribute('aria-label')).toBe('Dark mode')
  })
})
