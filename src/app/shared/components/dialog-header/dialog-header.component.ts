import { Component, Input } from '@angular/core'

/**
 * The head of an editor dialog, such as sharing or the story options: a mark, what the dialog is
 * about and the story's name. The mark's icon is projected, so each dialog draws its own at 23px.
 */
@Component({
  selector: 'polo-dialog-header',
  standalone: true,
  templateUrl: './dialog-header.component.html',
  styleUrl: './dialog-header.component.css',
})
export class DialogHeaderComponent {
  @Input({ required: true }) eyebrow!: string
  @Input({ required: true }) title!: string
}
