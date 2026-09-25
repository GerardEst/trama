import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SelectorComponent } from './selector.component'

describe('SelectorComponent', () => {
  let component: SelectorComponent
  let fixture: ComponentFixture<SelectorComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SelectorComponent],
    })
    fixture = TestBed.createComponent(SelectorComponent)
    component = fixture.componentInstance
    component.options = [
      { id: 'stat_courage', name: 'Courage' },
      { id: 'stat_insight', name: 'Insight' },
    ]
    fixture.detectChanges()
  })

  afterEach(() => fixture.nativeElement.remove())

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows the selected option name', () => {
    fixture.componentRef.setInput('selected', 'stat_courage')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Courage')
  })

  it('places the dropdown above the selector when there is no room below', () => {
    const host: HTMLElement = fixture.nativeElement
    host.style.cssText = 'position: fixed; bottom: 1rem; left: 1rem; width: 25rem'
    document.body.appendChild(host)

    host.querySelector<HTMLButtonElement>('.selector')!.click()
    fixture.detectChanges()

    const trigger = host.querySelector('.selector')!.getBoundingClientRect()
    const dropdown = host.querySelector('.selector__popover')!.getBoundingClientRect()
    expect(dropdown.bottom).toBeLessThanOrEqual(trigger.top)
    expect(dropdown.top).toBeGreaterThanOrEqual(0)
  })

  it('keeps a long dropdown within the available space above the selector', () => {
    const host: HTMLElement = fixture.nativeElement
    fixture.componentRef.setInput('options', Array.from({ length: 20 }, (_, index) => ({
      id: `option_${index}`,
      name: `Option ${index}`,
    })))
    host.style.cssText = 'position: fixed; bottom: 40vh; left: 1rem; width: 25rem'
    document.body.appendChild(host)
    fixture.detectChanges()

    host.querySelector<HTMLButtonElement>('.selector')!.click()
    fixture.detectChanges()

    const trigger = host.querySelector('.selector')!.getBoundingClientRect()
    const dropdown = host.querySelector('.selector__popover')!.getBoundingClientRect()
    expect(dropdown.bottom).toBeLessThanOrEqual(trigger.top)
    expect(dropdown.top).toBeGreaterThanOrEqual(0)
    const options = host.querySelector<HTMLElement>('.dropdown__options')!
    expect(options.scrollHeight).toBeGreaterThan(options.clientHeight)
  })

  it('keeps the dropdown below the selector when there is room', () => {
    const host: HTMLElement = fixture.nativeElement
    host.style.cssText = 'position: fixed; top: 1rem; left: 1rem; width: 25rem'
    document.body.appendChild(host)

    host.querySelector<HTMLButtonElement>('.selector')!.click()
    fixture.detectChanges()

    const trigger = host.querySelector('.selector')!.getBoundingClientRect()
    const dropdown = host.querySelector('.selector__popover')!.getBoundingClientRect()
    expect(dropdown.top).toBeGreaterThanOrEqual(trigger.bottom)
  })

  it('emits typed selection changes and closes the options', () => {
    spyOn(component.selectionChanged, 'emit')
    component.optionsOpened = true

    component.selectOption({
      value: 'stat_insight',
      previousValue: 'stat_courage',
    })

    expect(component.selectionChanged.emit).toHaveBeenCalledWith({
      value: 'stat_insight',
      previousValue: 'stat_courage',
    })
    expect(component.optionsOpened).toBeFalse()
  })
})
