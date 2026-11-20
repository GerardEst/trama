import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'

import { BoardActionsComponent } from './board-actions.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { ViewportService } from 'src/app/core/services/viewport.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'

describe('BoardActionsComponent', () => {
  let component: BoardActionsComponent
  let fixture: ComponentFixture<BoardActionsComponent>
  const host = () => fixture.nativeElement as HTMLElement
  const buttons = () => Array.from(host().querySelectorAll<HTMLButtonElement>('.actions > polo-basic-button button'))
  const names = () => buttons().map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim())

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardActionsComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    TestBed.inject(ViewportService).mobile.set(false)
    TestBed.inject(ActiveStoryService).load('story-1', 'Story', { nodes: [] })
    fixture = TestBed.createComponent(BoardActionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('tries and shares the story, sharing as the one main action, then its analytics and options, and nothing of the account', () => {
    expect(names()).toEqual(['Preview', 'Share', 'Analytics', 'Story options'])
    expect(buttons()[1].classList).toContain('primary')
    expect(buttons().filter((button) => button.classList.contains('primary')).length).toBe(1)
    // The person's account is a step away, at Home, not among the story's actions.
    expect(host().querySelector('polo-user-menu')).toBeNull()
  })

  it('asks for the preview, the share dialog and the options, and opens the analytics page', () => {
    const preview = spyOn(component.previewRequested, 'emit')
    const share = spyOn(component.shareRequested, 'emit')
    const options = spyOn(component.optionsRequested, 'emit')
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    for (const button of buttons()) button.click()
    expect(preview).toHaveBeenCalledTimes(1)
    expect(share).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith(['/story', 'story-1', 'statistics'])
    expect(options).toHaveBeenCalledTimes(1)
  })

  it('keeps the analytics closed for an example that is not stored yet', () => {
    TestBed.inject(StoryMutationService).loadDraft('example', 'Example', { nodes: [] })
    fixture.detectChanges()
    expect(buttons()[2].disabled).toBeTrue()
  })

  it('drops the preview button while the preview is open beside the board', () => {
    fixture.componentRef.setInput('previewOpen', true)
    fixture.detectChanges()
    expect(names()).toEqual(['Share', 'Analytics', 'Story options'])
  })

  it('keeps trying and sharing as icons on phones and folds the rest into one menu', () => {
    TestBed.inject(ViewportService).mobile.set(true)
    fixture.detectChanges()
    expect(names()).toEqual(['Preview', 'Share'])
    expect(buttons().every((button) => !button.textContent?.trim())).toBeTrue()
    const more = host().querySelector<HTMLButtonElement>('button.more')!
    expect(more.getAttribute('aria-label')).toBe('More actions')
    const menu = host().querySelector<HTMLElement>('.moreMenu')!
    expect(more.getAttribute('popovertarget')).toBe(menu.id)
    expect(Array.from(menu.querySelectorAll('button, a')).map((item) => item.textContent?.trim()))
      .toEqual(['Analytics', 'Story options'])
    expect(host().querySelector('polo-user-menu')).toBeNull()
  })
})
