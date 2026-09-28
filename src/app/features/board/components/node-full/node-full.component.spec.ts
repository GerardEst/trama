import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NodeFullComponent } from './node-full.component'

describe('NodeFullComponent', () => {
  let fixture: ComponentFixture<NodeFullComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NodeFullComponent] })
    fixture = TestBed.createComponent(NodeFullComponent)
    fixture.componentRef.setInput('nodeId', 'node_7')
    fixture.componentRef.setInput('type', 'text')
    fixture.componentRef.setInput('text', 'Original prompt')
    fixture.detectChanges()
  })

  it('opens a focused editor and returns the edited text on close', async () => {
    const component = fixture.componentInstance
    const panel = (fixture.nativeElement as HTMLElement).querySelector('dialog') as HTMLDialogElement
    const textarea = panel.querySelector('textarea') as HTMLTextAreaElement
    const closed = jasmine.createSpy('closed')
    component.closed.subscribe(closed)

    expect(panel.open).toBeTrue()
    expect(getComputedStyle(panel).animationDuration).toBe(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '0s' : '0.24s'
    )
    expect(document.activeElement).toBe(textarea)
    expect(textarea.value).toBe('Original prompt')
    expect(textarea.getAttribute('aria-label')).toBe('Prompt')
    expect(panel.textContent).not.toContain('Passage')
    expect(getComputedStyle(panel).borderRadius).toBe('0px')
    expect(getComputedStyle(textarea).borderWidth).toBe('0px')
    expect(getComputedStyle(textarea).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(parseFloat(getComputedStyle(textarea).fontSize)).toBeGreaterThan(18)

    textarea.value = 'Rewritten prompt'
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    const closeEvent = new Promise<void>((resolve) => {
      panel.addEventListener('close', () => resolve(), { once: true })
    })
    component.close()
    await closeEvent

    expect(closed).toHaveBeenCalledOnceWith('Rewritten prompt')
  })

  it('uses the current light or dark surface as the writing page', () => {
    const panel = (fixture.nativeElement as HTMLElement).querySelector('dialog') as HTMLDialogElement
    const previousTheme = document.documentElement.dataset['storybookTheme']
    try {
      document.documentElement.dataset['storybookTheme'] = 'light'
      expect(getComputedStyle(panel).backgroundColor).toBe('rgb(255, 255, 255)')
      document.documentElement.dataset['storybookTheme'] = 'dark'
      expect(getComputedStyle(panel).backgroundColor).toBe('rgb(35, 45, 61)')
    } finally {
      if (previousTheme) document.documentElement.dataset['storybookTheme'] = previousTheme
      else delete document.documentElement.dataset['storybookTheme']
    }
  })
})
