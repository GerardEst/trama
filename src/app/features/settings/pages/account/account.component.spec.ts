import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { AccountComponent } from './account.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { AuthService } from 'src/app/core/services/auth.service'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('AccountComponent', () => {
  async function render(provider: string) {
    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    TestBed.inject(DatabaseService).user.set({
      id: 'author-1', email: 'marta@example.com', user_metadata: { user_name: 'Marta' }, app_metadata: { provider }, profile: {},
    } as unknown as appUser)
    const fixture = TestBed.createComponent(AccountComponent)
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  it('groups who the person is and how they sign in, each with a line about it', async () => {
    const host = await render('email')
    expect(Array.from(host.querySelectorAll('h2')).map((title) => title.textContent?.trim())).toEqual(['Your details', 'Sign-in'])
    expect(Array.from(host.querySelectorAll('.setting__value')).map((value) => value.textContent?.trim())).toEqual(['marta@example.com', 'Marta'])
    expect(Array.from(host.querySelectorAll('button')).map((button) => button.textContent?.trim())).toEqual(['Change your password', 'Logout'])
  })

  it('says who keeps the password of someone who signs in with another service', async () => {
    const host = await render('google')
    expect(host.textContent).toContain('You sign in with Google')
    expect(Array.from(host.querySelectorAll('button')).map((button) => button.textContent?.trim())).toEqual(['Logout'])
  })

  it('signs out and goes to the sign-in page', async () => {
    const host = await render('email')
    const logout = spyOn(TestBed.inject(AuthService), 'logoutUser')
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.includes('Logout'))!.click()
    expect(logout).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith(['/login'])
  })
})
