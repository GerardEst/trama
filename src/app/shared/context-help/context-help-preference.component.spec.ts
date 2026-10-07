import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ContextHelpPreferenceComponent } from './context-help-preference.component'
import { ContextHelpService } from './context-help.service'

const KEY = 'polo-context-help'

describe('ContextHelpPreferenceComponent', () => {
  let fixture: ComponentFixture<ContextHelpPreferenceComponent>
  let previous: string | null

  beforeEach(() => {
    previous = localStorage.getItem(KEY)
    localStorage.removeItem(KEY)
    TestBed.configureTestingModule({ imports: [ContextHelpPreferenceComponent] })
    fixture = TestBed.createComponent(ContextHelpPreferenceComponent)
    fixture.detectChanges()
  })

  afterEach(() => {
    fixture.destroy()
    if (previous === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, previous)
  })

  it('labels the switch and persists the dashboard preference', () => {
    const toggle: HTMLInputElement = fixture.nativeElement.querySelector('input')
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label')
    expect(label.htmlFor).toBe(toggle.id)
    expect(toggle.checked).toBeTrue()
    toggle.click()
    fixture.detectChanges()
    expect(TestBed.inject(ContextHelpService).enabled()).toBeFalse()
    expect(toggle.checked).toBeFalse()
    expect(localStorage.getItem(KEY)).toBe('false')
  })

  it('reflects external preference changes', () => {
    TestBed.inject(ContextHelpService).setEnabled(false)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('input').checked).toBeFalse()
  })
})
