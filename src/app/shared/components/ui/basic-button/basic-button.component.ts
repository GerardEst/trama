import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-basic-button',
  standalone: true,
  imports: [],
  templateUrl: './basic-button.component.html',
  styleUrl: './basic-button.component.css',
})
export class BasicButtonComponent {
  @Input() title?: string | undefined
  /** The accessible name of an icon-only button when the title adds more, such as a shortcut. */
  @Input() label?: string | undefined
  /** For a button that shows and hides a region: whether it is open, and the region's id. */
  @Input() expanded?: boolean | undefined
  @Input() controls?: string | undefined
  @Input() text?: string | undefined
  @Input() icon?: string | undefined
  @Input() size?: 's' | undefined
  /** `primary` is the one main action of a toolbar, such as sharing the story. */
  @Input() type?: 'danger' | 'success' | 'primary' | undefined
  @Input() selected: boolean = false
  @Input() waiting: boolean = false
  @Input() transparent: boolean = false
  @Input() iconSize: number = 15
  @Input() disabled: boolean = false
  @Input() align?: 'left' | 'right' | 'center' = 'center'
  @Input() border: boolean = false
}
