import { ComponentFixture, TestBed } from '@angular/core/testing'
import { GameTextInputComponent } from './game-text-input.component'

describe('GameTextInputComponent', () => {
  let fixture: ComponentFixture<GameTextInputComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GameTextInputComponent] }).compileComponents()
    fixture = TestBed.createComponent(GameTextInputComponent)
    fixture.componentInstance.options = {
      property: 'name', description: 'What is your name?', buttonText: 'Save name',
    }
    fixture.detectChanges()
  })

  it('labels the input and submits using the form', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input')
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button')
    const submitted = spyOn(fixture.componentInstance.submitted, 'emit')
    expect(fixture.nativeElement.querySelector('label')?.textContent).toContain('What is your name?')
    expect(input.labels?.[0].textContent).toContain('What is your name?')
    expect(button.textContent).toContain('Save name')

    input.value = 'Ada'
    input.dispatchEvent(new Event('input'))
    fixture.detectChanges()
    expect(button.disabled).toBeFalse()
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await fixture.whenStable()
    expect(submitted).toHaveBeenCalledOnceWith('Ada')
  })

  it('does not submit empty text', () => {
    const submitted = spyOn(fixture.componentInstance.submitted, 'emit')
    fixture.componentInstance.submit()
    expect(submitted).not.toHaveBeenCalled()
  })
})
