import { Component, Input } from '@angular/core'
import { RouterLink } from '@angular/router'

/**
 * Trama's name as the landing's header draws it, linking home. `link` is a route inside the app;
 * `href` a plain address, such as the site's pages, which the router does not own.
 */
@Component({
  selector: 'polo-wordmark',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wordmark.component.html',
  styleUrl: './wordmark.component.css',
  host: { '[class.small]': "size === 's'" },
})
export class WordmarkComponent {
  @Input({ required: true }) label!: string
  @Input() link?: string
  @Input() href?: string
  /** `s` fits a toolbar; the default matches the landing's header. */
  @Input() size?: 's'
}
