import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'

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
            authenticationRequired: signal(false),
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

  it('exposes undo and redo controls with availability derived from the in-memory history', () => {
    const story = TestBed.inject(ActiveStoryService)
    story.load('story-1', 'Story', { nodes: [] })
    story.beginHistorySession()
    fixture.detectChanges()
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.historyControls button')
    expect(buttons[0].textContent).toContain('Undo')
    expect(buttons[1].textContent).toContain('Redo')
    expect(buttons[0].disabled).toBeTrue()
    expect(buttons[1].disabled).toBeTrue()
    story.updateTree(draft => { draft.nodes.push({ id: 'node_0', type: 'content', top: 0, left: 0 }) })
    fixture.detectChanges()
    expect(buttons[0].disabled).toBeFalse()
    const requested = spyOn(component.historyRequested, 'emit')
    buttons[0].click()
    expect(requested).toHaveBeenCalledWith('undo')
    story.undoTree()
    fixture.detectChanges()
    expect(buttons[0].disabled).toBeTrue()
    expect(buttons[1].disabled).toBeFalse()
    buttons[1].click()
    expect(requested).toHaveBeenCalledWith('redo')
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

  it('offers reauthentication and export without clearing the active story', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'Story', { nodes: [] })
    TestBed.inject(DatabaseService).authenticationRequired.set(true)
    fixture.detectChanges()
    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')!
    expect(alert.textContent).toContain('Your session has ended')
    expect(alert.textContent).toContain('Sign in again')
    expect(alert.textContent).toContain('Export JSON')
    expect(activeStory.storyId()).toBe('story-1')
  })

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
    expect(component.exportError).toBeNull()
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
