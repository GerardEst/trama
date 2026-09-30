import { TestBed } from '@angular/core/testing'
import { GameEndActionsComponent } from './game-end-actions.component'

describe('GameEndActionsComponent', () => {
  it('renders an accessible share button without optional customization', async () => {
    await TestBed.configureTestingModule({ imports: [GameEndActionsComponent] }).compileComponents()
    const fixture = TestBed.createComponent(GameEndActionsComponent)
    fixture.componentInstance.sharing = true
    fixture.componentInstance.links = [{ name: 'Read another story', url: 'trama.app' }]
    fixture.detectChanges()

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button')
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a')
    expect(button.textContent).toContain('Share this story')
    expect(link.href).toBe('https://trama.app/')
    expect(link.rel).toContain('noopener')
    const originalShare = Object.getOwnPropertyDescriptor(navigator, 'share')
    const share = jasmine.createSpy('share').and.returnValue(Promise.resolve())
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    try {
      await fixture.componentInstance.shareStory()
      expect(share).toHaveBeenCalledWith({ text: '', url: window.location.href })
    } finally {
      if (originalShare) Object.defineProperty(navigator, 'share', originalShare)
      else Reflect.deleteProperty(navigator, 'share')
    }
  })
})
