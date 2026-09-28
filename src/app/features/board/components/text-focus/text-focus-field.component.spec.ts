import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TextFocusFieldComponent } from './text-focus-field.component'

@Component({
  standalone: true,
  imports: [TextFocusFieldComponent],
  template: `
    <polo-text-focus-field label="Test text">
      <textarea #focusTextarea aria-label="Test text" (change)="saved = $any($event.target).value">First draft</textarea>
    </polo-text-focus-field>
    <input aria-label="Other control" />
  `,
})
class TestHostComponent {
  saved = ''
}

describe('TextFocusFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>
  let host: HTMLElement
  let textarea: HTMLTextAreaElement

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] })
    fixture = TestBed.createComponent(TestHostComponent)
    fixture.detectChanges()
    host = fixture.nativeElement as HTMLElement
    textarea = host.querySelector('textarea') as HTMLTextAreaElement
  })

  it('opens from the field button and writes back through the existing change handler', async () => {
    const button = host.querySelector('.textFocusField__button button') as HTMLButtonElement
    expect(button.title).toContain('Ctrl+F')
    button.click()
    fixture.detectChanges()

    const dialog = host.querySelector('dialog') as HTMLDialogElement
    const editor = dialog.querySelector('textarea') as HTMLTextAreaElement
    expect(dialog.open).toBeTrue()
    expect(editor.value).toBe('First draft')
    editor.value = 'New draft'
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    const closed = new Promise<void>((resolve) => dialog.addEventListener('close', () => resolve(), { once: true }))
    dialog.close()
    await closed
    fixture.detectChanges()

    expect(textarea.value).toBe('New draft')
    expect(fixture.componentInstance.saved).toBe('New draft')
  })

  it('intercepts Ctrl+F only from its textarea, not other controls', () => {
    const input = host.querySelector('input') as HTMLInputElement
    const outside = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true })
    input.focus()
    input.dispatchEvent(outside)
    fixture.detectChanges()
    expect(outside.defaultPrevented).toBeFalse()
    expect(host.querySelector('dialog')).toBeNull()

    const shortcut = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true })
    textarea.focus()
    textarea.dispatchEvent(shortcut)
    fixture.detectChanges()
    expect(shortcut.defaultPrevented).toBeTrue()
    expect(host.querySelector('dialog')).not.toBeNull()
  })
})
