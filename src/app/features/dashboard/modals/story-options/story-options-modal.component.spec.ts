import { ComponentFixture, TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { By } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { StoryOptionsModalComponent } from './story-options-modal.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryOptionsComponent } from 'src/app/shared/components/story-options/story-options.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { AlertService } from 'src/app/core/services/alert.service'

describe('StoryOptionsModalComponent', () => {
  let fixture: ComponentFixture<StoryOptionsModalComponent>
  let alert: jasmine.SpyObj<AlertService>
  const host = () => fixture.nativeElement as HTMLElement
  const button = (text: string) => Array.from(host().querySelectorAll('button')).find((item) => item.textContent?.includes(text))!

  beforeEach(async () => {
    alert = jasmine.createSpyObj<AlertService>('AlertService', ['launch'])
    await TestBed.configureTestingModule({
      imports: [StoryOptionsModalComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AlertService, useValue: alert },
        {
          provide: DatabaseService,
          useValue: {
            authenticationRequired: signal(false),
            setTrackingOf: jasmine.createSpy('setTrackingOf').and.resolveTo(true),
            saveTreeToDB: () => Promise.resolve(true),
          },
        },
      ],
    }).compileComponents()
    TestBed.inject(ActiveStoryService).load('story-1', 'The island', { nodes: [] })
    fixture = TestBed.createComponent(StoryOptionsModalComponent)
    fixture.detectChanges()
  })

  it('is a dialog headed like sharing, with the story name', () => {
    expect(host().querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Story options')
    expect(host().querySelector('polo-dialog-header .eyebrow')?.textContent).toContain('Story options')
    expect(host().querySelector('polo-dialog-header h2')?.textContent).toContain('The island')
  })

  it('holds the shared story options, but neither sharing nor analytics', async () => {
    const options = fixture.debugElement.query(By.directive(StoryOptionsComponent)).componentInstance as StoryOptionsComponent
    // Switches for what is on or off, fields for the footer's words, all usable.
    for (const name of ['Enable tracking', 'Hide Trama link']) {
      const toggle = host().querySelector<HTMLButtonElement>(`button[role="switch"][aria-label="${name}"]`)
      expect(toggle).withContext(name).not.toBeNull()
      expect(toggle!.disabled).withContext(name).toBeFalse()
    }
    for (const name of ['Footer text', 'Footer link']) {
      const label = Array.from(host().querySelectorAll('label')).find((item) => item.textContent?.includes(name))!
      expect(label).withContext(name).toBeDefined()
      expect(label.querySelector('input')!.disabled).withContext(name).toBeFalse()
    }
    expect(button('Share')).toBeUndefined()
    expect(button('analytics')).toBeUndefined()
    await options.toggleTracking()
    expect(TestBed.inject(DatabaseService).setTrackingOf).toHaveBeenCalledWith('story-1', true)
  })

  it('leaves the story’s data and deleting it to its page, a link away', () => {
    expect(button('Export JSON')).toBeUndefined()
    expect(button('Delete')).toBeUndefined()
    const link = host().querySelector<HTMLAnchorElement>('a.allOptions')!
    expect(link.getAttribute('href')).toBe('/story/story-1')
    expect(link.textContent).toContain('All the story’s settings')
  })
})
