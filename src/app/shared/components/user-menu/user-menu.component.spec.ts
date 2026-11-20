import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { UserMenuComponent } from './user-menu.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('UserMenuComponent', () => {
  let fixture: ComponentFixture<UserMenuComponent>
  const host = () => fixture.nativeElement as HTMLElement
  const trigger = () => host().querySelector<HTMLButtonElement>('.trigger')!
  const menu = () => host().querySelector<HTMLElement>('.menu')!

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    TestBed.inject(DatabaseService).user.set({ id: 'author-1', email: 'marta@example.com', profile: { user_name: 'marta' } } as unknown as appUser)
    fixture = TestBed.createComponent(UserMenuComponent)
    fixture.detectChanges()
    document.body.appendChild(host())
  })

  afterEach(() => host().remove())

  it('names the person on a button that opens the menu as a native popover', () => {
    expect(trigger().getAttribute('aria-label')).toBe('marta, account menu')
    expect(host().querySelector('.avatar')?.textContent?.trim()).toBe('M')
    expect(trigger().getAttribute('popovertarget')).toBe(menu().id)
    expect(menu().getAttribute('popover')).toBe('auto')

    trigger().click()
    expect(menu().matches(':popover-open')).toBeTrue()
    expect(menu().querySelector('.menu__email')?.textContent).toContain('marta@example.com')
  })


  it('gives every menu on the page its own popover', () => {
    const other = TestBed.createComponent(UserMenuComponent)
    other.detectChanges()
    expect(other.componentInstance.menuId).not.toBe(fixture.componentInstance.menuId)
  })

  it('links to the settings and the guide and closes once a page is picked', () => {
    const links = Array.from(menu().querySelectorAll('a')).map((link) => link.getAttribute('href'))
    expect(links).toEqual(['/settings/account', '/docs/features'])

    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true)
    trigger().click()
    menu().querySelector<HTMLAnchorElement>('a')!.click()
    expect(menu().matches(':popover-open')).toBeFalse()
  })

  it('signs out from the menu too, where people look for it', () => {
    const items = Array.from(menu().querySelectorAll('a, button')).map((item) => item.textContent?.trim())
    expect(items).toEqual(['Account', 'Guide', 'Logout'])
  })
})
