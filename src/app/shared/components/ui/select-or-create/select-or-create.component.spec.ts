import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SelectOrCreateComponent } from './select-or-create.component'

describe('SelectOrCreateComponent', () => {
  let component: SelectOrCreateComponent
  let fixture: ComponentFixture<SelectOrCreateComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectOrCreateComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(SelectOrCreateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('filters options without offering duplicate names', () => {
    component.options = [
      { id: 'stat_1', name: 'Health' },
      { id: 'stat_2', name: 'Reputation' },
    ]

    component.filterOptions({ target: { value: 'health' } } as unknown as Event)

    expect(component.searchedOptions).toEqual([
      { id: 'stat_1', name: 'Health' },
    ])
    expect(component.newOption).toBeUndefined()
  })

  it('keeps the selected id and reports the previous selection', () => {
    spyOn(component.onSelectOption, 'emit')
    component.selectedOption = 'stat_1'

    component.selectOption({ id: 'stat_2', name: 'Reputation' })

    expect(component.selectedOption).toBe('stat_2')
    expect(component.onSelectOption.emit).toHaveBeenCalledWith({
      value: 'stat_2',
      previousValue: 'stat_1',
    })
  })
})
