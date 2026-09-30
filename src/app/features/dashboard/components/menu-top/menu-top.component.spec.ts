import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing'

import { MenuTopComponent } from './menu-top.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { provideRouter } from '@angular/router'
import { AlertService } from 'src/app/core/services/alert.service'
import { StoryExportService } from 'src/app/shared/services/story-export.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'

describe('MenuTopComponent', () => {
  let component: MenuTopComponent
  let fixture: ComponentFixture<MenuTopComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTopComponent],
      providers: [
        provideRouter([]),
        {
          provide: DatabaseService,
          useValue: {
            userPlanIs: () => false,
            saveNewStoryName: () => Promise.resolve(true),
            saveTreeToDB: () => Promise.resolve(true),
          },
        },
        { provide: AlertService, useValue: {} },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(MenuTopComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows a failed save and lets the author retry without opening story options', fakeAsync(() => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'Story', { nodes: [] })
    const save = spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(false)
    const mutations = TestBed.inject(StoryMutationService)
    mutations.update((draft) => { draft.nodes.push({ id: 'node_0', type: 'content', top: 0, left: 0 }) })
    flushMicrotasks()
    fixture.detectChanges()

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Board changes not saved')
    const retry = Array.from(host.querySelectorAll('button')).find((button) => button.textContent?.includes('Retry save'))!
    expect(retry).toBeDefined()
    expect(component.showOptions).toBeFalse()
    save.and.resolveTo(true)
    retry.click()
    flushMicrotasks()
    fixture.detectChanges()
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Board changes saved')
    expect(save).toHaveBeenCalledTimes(2)
  }))

  it('offers JSON export for free users in story options', () => {
    TestBed.inject(ActiveStoryService).load('story-1', 'Story', { nodes: [] })
    component.toggleOptions()
    fixture.detectChanges()

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    )
    const exportButton = buttons.find((button) => button.textContent?.includes('Export JSON'))
    expect(exportButton).toBeDefined()
    expect(exportButton?.disabled).toBeFalse()
  })

  it('disables JSON export when there is no active story', () => {
    component.toggleOptions()
    fixture.detectChanges()

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    )
    const exportButton = buttons.find((button) => button.textContent?.includes('Export JSON'))
    expect(exportButton).toBeDefined()
    expect(exportButton?.disabled).toBeTrue()
  })

  it('downloads JSON and closes the options when the export button is clicked', () => {
    TestBed.inject(ActiveStoryService).load('story-1', 'Story', { nodes: [] })
    const download = spyOn(TestBed.inject(StoryExportService), 'downloadJson')
    component.toggleOptions()
    fixture.detectChanges()

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    )
    buttons.find((button) => button.textContent?.includes('Export JSON'))!.click()
    expect(download).toHaveBeenCalledTimes(1)
    expect(component.showOptions).toBeFalse()
  })

  it('shows an error and allows retrying if export fails', () => {
    TestBed.inject(ActiveStoryService).load('story-1', 'Story', { nodes: [] })
    const download = spyOn(TestBed.inject(StoryExportService), 'downloadJson').and.throwError('Download failed')
    spyOn(console, 'error')
    component.toggleOptions()
    component.exportTree()
    fixture.detectChanges()

    expect(component.showOptions).toBeTrue()
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent)
      .toContain('Could not export the story')

    download.and.stub()
    component.exportTree()
    expect(component.exportError).toBe('')
    expect(component.showOptions).toBeFalse()
  })

  it('ignores export requests without an active story', () => {
    const download = spyOn(TestBed.inject(StoryExportService), 'downloadJson')
    component.exportTree()
    expect(download).not.toHaveBeenCalled()
  })

  it('saves the story name from the shared editor', async () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'Original story', { nodes: [] })
    const save = spyOn(TestBed.inject(DatabaseService), 'saveNewStoryName').and.resolveTo(true)
    fixture.detectChanges()
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('polo-editable-name input')!
    expect(input.value).toBe('Original story')
    input.value = 'New story'
    input.dispatchEvent(new Event('change'))
    await Promise.resolve()
    expect(save).toHaveBeenCalledOnceWith('story-1', 'New story')
    expect(activeStory.storyName()).toBe('New story')
  })
})
