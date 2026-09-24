import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormFieldComponent } from './form-field.component'

describe('FormFieldComponent', () => {
  let component: FormFieldComponent
  let fixture: ComponentFixture<FormFieldComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(FormFieldComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })

  it('associates its label and description with a control', () => {
    component.label = 'Stat'
    component.controlId = 'stat-selector'
    component.description = 'Choose a stat'
    component.required = true
    fixture.detectChanges()

    const label = fixture.nativeElement.querySelector('label')
    const description = fixture.nativeElement.querySelector(
      `#${component.descriptionId}`
    )

    expect(label.getAttribute('for')).toBe('stat-selector')
    expect(description.textContent).toContain('Choose a stat')
    expect(fixture.nativeElement.textContent).toContain('Required')
  })
})
