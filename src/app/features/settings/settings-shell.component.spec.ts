import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { SettingsShellComponent } from './settings-shell.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('SettingsShellComponent', () => {
  it('goes back to the stories and links the account, the preferences and the plan', async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsShellComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    TestBed.inject(DatabaseService).user.set({ id: 'author-1', email: 'marta@example.com', profile: { user_name: 'marta' } } as unknown as appUser)
    const fixture = TestBed.createComponent(SettingsShellComponent)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement

    expect(host.querySelector('.back')?.getAttribute('href')).toBe('/dashboard')
    // Named Home, as in the board and in the dashboard's own menu.
    expect(host.querySelector('.back')?.textContent?.trim()).toBe('Home')
    const nav = host.querySelector('nav')!
    expect(nav.getAttribute('aria-labelledby')).toBe('settings-title')
    expect(host.querySelector('#settings-title')?.textContent).toContain('Settings')
    expect(Array.from(nav.querySelectorAll('a')).map((link) => link.getAttribute('href'))).toEqual(['/settings/account', '/settings/preferences', '/settings/billing'])
    expect(host.querySelector('.sidebar > polo-user-menu')).toBeTruthy()
  })
})
