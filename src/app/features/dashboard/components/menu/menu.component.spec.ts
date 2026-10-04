import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ModalService } from 'src/app/core/services/modal.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component'
import { MenuComponent } from './menu.component'

describe('MenuComponent', () => {
  let component: MenuComponent
  let fixture: ComponentFixture<MenuComponent>
  const launch = jasmine.createSpy('launch')

  beforeEach(() => {
    launch.calls.reset()
    TestBed.configureTestingModule({
      imports: [MenuComponent],
      providers: [
        provideRouter([]),
        {
          provide: DatabaseService,
          useValue: {
            user: signal({ id: 'author', profile: { user_name: 'Author', subscription_status: 'active' } }),
            getAllTreesForUser: () => Promise.resolve([]),
          },
        },
        { provide: ModalService, useValue: { launch } },
      ],
    })
    fixture = TestBed.createComponent(MenuComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('links the brand to the home and documentation to the feature guide', () => {
    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('.wordmark')?.getAttribute('href')).toBe('/')
    expect(host.querySelector('.account a')?.getAttribute('href')).toBe('/docs/features')
  })

  it('uses native buttons for stories and exposes the current story', async () => {
    await fixture.whenStable()
    TestBed.inject(ActiveStoryService).load('story-1', 'First story', { nodes: [] })
    component.stories.set([
      { id: 'story-1', name: 'First story' },
      { id: 'story-2', name: 'Second story' },
    ])
    fixture.detectChanges()
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.story')
    expect(buttons[0].getAttribute('aria-current')).toBe('true')
    expect(buttons[1].hasAttribute('aria-current')).toBeFalse()
    const change = spyOn(component.onChangeTree, 'emit')
    buttons[1].click()
    expect(change).toHaveBeenCalledOnceWith('story-2')
  })

  it('preserves the new-story and account actions', () => {
    const create = spyOn(component.onNewStory, 'emit')
    const host = fixture.nativeElement as HTMLElement
    host.querySelector<HTMLButtonElement>('.newStory button')!.click()
    expect(create).toHaveBeenCalledTimes(1)
    host.querySelector<HTMLButtonElement>('.account button')!.click()
    expect(launch).toHaveBeenCalledOnceWith(ProfileModalComponent)
  })

  it('can collapse and reopen the sidebar', () => {
    const host = fixture.nativeElement as HTMLElement
    host.querySelector<HTMLButtonElement>('.menuToggler button')!.click()
    fixture.detectChanges()
    expect(component.fixedMenu).toBeFalse()
    expect(host.querySelector('.menu')?.classList.contains('fixedMenu')).toBeFalse()
    expect(host.querySelector('.menuToggler')).toBeNull()
    expect(host.querySelector('.menu__edge')).not.toBeNull()
    host.querySelector<HTMLButtonElement>('.openMenu button')!.click()
    fixture.detectChanges()
    expect(component.fixedMenu).toBeTrue()
    expect(host.querySelector('.menuToggler')).not.toBeNull()
    expect(host.querySelector('.menu__edge')).toBeNull()
  })
})
