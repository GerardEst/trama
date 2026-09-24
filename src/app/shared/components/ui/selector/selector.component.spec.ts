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

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows the selected option name', () => {
    fixture.componentRef.setInput('selected', 'stat_courage')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Courage')
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
