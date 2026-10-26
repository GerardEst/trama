import { ComponentFixture, TestBed } from '@angular/core/testing'
import { GameEndActionsComponent } from './game-end-actions.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { environment } from 'src/environments/environment'

describe('GameEndActionsComponent', () => {
  let fixture: ComponentFixture<GameEndActionsComponent>
  let component: GameEndActionsComponent
  let nativeShare: jasmine.Spy
  let copy: jasmine.Spy
  let originalShare: PropertyDescriptor | undefined
  let originalClipboard: PropertyDescriptor | undefined

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GameEndActionsComponent] }).compileComponents()
    const story = TestBed.inject(ActiveStoryService)
    story.load('island-id', 'The island', { nodes: [] })
    story.patchConfiguration({ customId: 'the-island' })
    fixture = TestBed.createComponent(GameEndActionsComponent)
    component = fixture.componentInstance
    component.sharing = true
    component.text = 'The murderer was the captain.'
    originalShare = Object.getOwnPropertyDescriptor(navigator, 'share')
    originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    nativeShare = jasmine.createSpy('share').and.resolveTo()
    copy = jasmine.createSpy('copy').and.resolveTo()
    Object.defineProperty(navigator, 'share', { configurable: true, value: nativeShare })
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: copy } })
    fixture.detectChanges()
  })

  afterEach(() => {
    if (originalShare) Object.defineProperty(navigator, 'share', originalShare)
    else Reflect.deleteProperty(navigator, 'share')
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
    else Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('renders an accessible share button and safe external links', () => {
    component.links = [{ name: 'Read another story', url: 'trama.app' }]
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Share this story')
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement
    expect(link.href).toBe('https://trama.app/')
    expect(link.rel).toContain('noopener')
  })

  it('shares the canonical URL and a spoiler-free invitation, not the final passage', async () => {
    await component.shareStory()
    expect(nativeShare).toHaveBeenCalledWith({
      title: 'The island', text: 'Play “The island” and choose your own path.', url: `${environment.baseRoute}/the-island`,
    })
    expect(copy).not.toHaveBeenCalled()
  })

  it('preserves an authored sharing message', async () => {
    component.share = { sharedText: 'I found the secret entrance. Can you?' }
    await component.shareStory()
    expect(nativeShare.calls.mostRecent().args[0].text).toBe('I found the secret entrance. Can you?')
  })

  it('falls back to copying the canonical link when native sharing fails or is absent', async () => {
    nativeShare.and.rejectWith(new Error('Unavailable'))
    await component.shareStory()
    expect(copy).toHaveBeenCalledWith(`${environment.baseRoute}/the-island`)
    expect(component.feedback).toBe('playground.linkCopied')
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    await component.shareStory()
    expect(copy).toHaveBeenCalledTimes(2)
  })

  it('treats cancellation as cancellation, not a reason to copy a link', async () => {
    nativeShare.and.rejectWith(new DOMException('Cancelled', 'AbortError'))
    await component.shareStory()
    expect(copy).not.toHaveBeenCalled()
    expect(component.feedback).toBeNull()
  })

  it('offers a selectable link when both sharing and clipboard access fail', async () => {
    nativeShare.and.rejectWith(new Error('Unavailable'))
    copy.and.rejectWith(new Error('Denied'))
    await component.shareStory()
    fixture.detectChanges()
    expect(component.feedback).toBe('playground.copyManually')
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe(`${environment.baseRoute}/the-island`)
  })
})
