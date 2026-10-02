import { ComponentFixture, TestBed } from '@angular/core/testing'

import { LoginComponent } from './login.component'

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
    })
    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('uses the landing palette and typography', () => {
    const host = fixture.nativeElement as HTMLElement
    const style = getComputedStyle(host)
    expect(style.getPropertyValue('--paper').trim()).toBe('#fbf9f4')
    expect(style.getPropertyValue('--blue').trim()).toBe('#294b3e')
    expect(style.getPropertyValue('--accent').trim()).toBe('#f6ce6a')
    expect(style.backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(host.querySelector('h1')!).fontFamily).toContain('Raleway')
  })

  it('uses a yellow primary action in both login and registration', () => {
    const host = fixture.nativeElement as HTMLElement
    const loginButton = host.querySelector('.form__footer button')!
    expect(getComputedStyle(loginButton).backgroundColor).toBe('rgb(246, 206, 106)')

    component.mode = 'register'
    fixture.detectChanges()
    const registerButton = host.querySelector('form > polo-basic-button button')!
    expect(getComputedStyle(registerButton).backgroundColor).toBe('rgb(246, 206, 106)')
  })
})
