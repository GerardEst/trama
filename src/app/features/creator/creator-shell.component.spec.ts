import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { CreatorShellComponent } from './creator-shell.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { appUser } from 'src/app/core/interfaces/interfaces'
import { CreatorProfileComponent } from './pages/creator-profile/creator-profile.component'
import { AccessComponent } from './pages/access/access.component'

describe('CreatorShellComponent', () => {
  let fixture: ComponentFixture<CreatorShellComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatorShellComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    TestBed.inject(DatabaseService).user.set({ id: 'author-1', email: 'author@example.com', profile: { user_name: 'marta' } } as unknown as appUser)
    fixture = TestBed.createComponent(CreatorShellComponent)
    fixture.detectChanges()
  })

  it('links every section from the side menu, but not a board with no story picked', () => {
    const host = fixture.nativeElement as HTMLElement
    const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('nav a')).map((link) => link.getAttribute('href'))
    expect(links).toEqual(['/dashboard', '/dashboard/access', '/dashboard/profile'])
    expect(host.querySelector('nav a')?.textContent?.trim()).toBe('Home')
  })

  it('names the author at the foot of the side menu, in the menu that leads to the account and the guide', () => {
    const host = fixture.nativeElement as HTMLElement
    // The top of the menu is for moving around the app; the person comes last.
    const user = host.querySelector('.sidebar > polo-user-menu:last-child')
    expect(user?.textContent).toContain('marta')
    expect(host.querySelector('nav a[href^="/settings"]')).toBeNull()
  })
})

describe('dashboard sections that are design only', () => {
  it('keeps the creator profile form disabled until it can be saved', () => {
    TestBed.configureTestingModule({ imports: [CreatorProfileComponent] })
    const fixture = TestBed.createComponent(CreatorProfileComponent)
    fixture.detectChanges()
    const fieldset = (fixture.nativeElement as HTMLElement).querySelector('fieldset')!
    expect(fieldset.disabled).toBeTrue()
  })

  it('shows the creator profile as the only identity until brands can be added', () => {
    TestBed.configureTestingModule({ imports: [CreatorProfileComponent] })
    TestBed.inject(DatabaseService).user.set({ id: 'author-1', profile: { user_name: 'marta' } } as unknown as appUser)
    const fixture = TestBed.createComponent(CreatorProfileComponent)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelectorAll('.identity').length).toBe(1)
    expect(host.querySelector('.identity__name')?.textContent).toContain('marta')
    const addBrand = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.includes('Add a brand'))!
    expect(addBrand.disabled).toBeTrue()
  })

  it('does not offer to invite readers before access can be granted', () => {
    TestBed.configureTestingModule({ imports: [AccessComponent] })
    const fixture = TestBed.createComponent(AccessComponent)
    fixture.detectChanges()
    const invite = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.pageHeader button')!
    expect(invite.disabled).toBeTrue()
  })
})
