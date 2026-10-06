import { Component, input } from '@angular/core'
import type { RichTextEditorComponent } from './rich-text-editor.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

/** Formatting follows the last focused writing surface, not the toolbar's own focus. */
@Component({
  selector: 'polo-rich-text-toolbar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './rich-text-toolbar.component.html',
  styleUrl: './rich-text-toolbar.component.css',
})
export class RichTextToolbarComponent {
  readonly target = input<RichTextEditorComponent>()
  readonly embedded = input(false)
  readonly showBlockTools = input(false)

  unavailable() { return !this.target() || !!this.target()?.editor?.isDestroyed }
  blockUnavailable() { return this.unavailable() || !!this.target()?.inlineOnly() }
}
