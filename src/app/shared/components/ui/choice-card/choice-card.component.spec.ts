import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { ChoiceCardComponent } from './choice-card.component'

describe('ChoiceCardComponent', () => {
  let component: ChoiceCardComponent
  let fixture: ComponentFixture<ChoiceCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceCardComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ChoiceCardComponent)
    component = fixture.componentInstance
    component.label = 'Stat'
    component.description = 'Adjust a number'
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('emits when chosen', () => {
    spyOn(component.chosen, 'emit')

    fixture.debugElement.query(By.css('button')).nativeElement.click()

    expect(component.chosen.emit).toHaveBeenCalled()
  })

  it('exposes its selected state to assistive technology', () => {
    component.selected = true
    fixture.detectChanges()

    const button = fixture.debugElement.query(By.css('button')).nativeElement
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(button.classList).toContain('choiceCard--selected')
  })

  it('does not emit when disabled', () => {
    spyOn(component.chosen, 'emit')
    component.disabled = true
    fixture.detectChanges()

    fixture.debugElement.query(By.css('button')).nativeElement.click()

    expect(component.chosen.emit).not.toHaveBeenCalled()
  })
})
