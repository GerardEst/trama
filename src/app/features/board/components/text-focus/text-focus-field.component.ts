import { Component, ContentChild, ElementRef, input } from '@angular/core'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { TextFocusComponent } from './text-focus.component'

@Component({
  selector: 'polo-text-focus-field',
  standalone: true,
  imports: [BasicButtonComponent, TextFocusComponent],
  templateUrl: './text-focus-field.component.html',
  styleUrl: './text-focus-field.component.sass',
  host: { '(keydown)': 'onKeydown($event)' },
})
export class TextFocusFieldComponent {
  readonly label = input.required<string>()
  @ContentChild('focusTextarea', { read: ElementRef }) textarea?: ElementRef<HTMLTextAreaElement>

  focusOpen = false
  initialText = ''

  openFocus() {
    const textarea = this.textarea?.nativeElement
    if (!textarea || this.focusOpen) return
    this.initialText = textarea.value
    this.focusOpen = true
  }

  onKeydown(event: KeyboardEvent) {
    if (
      event.target !== this.textarea?.nativeElement ||
      !(event.ctrlKey || event.metaKey) ||
      event.altKey || event.shiftKey ||
      event.key.toLowerCase() !== 'f'
    ) return

    event.preventDefault()
    this.openFocus()
  }

  onClosed(text: string) {
    this.focusOpen = false
    const textarea = this.textarea?.nativeElement
    if (!textarea || textarea.value === text) return
    textarea.value = text
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.dispatchEvent(new Event('change', { bubbles: true }))
  }
}
