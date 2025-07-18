import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-separator',
  standalone: true,
  imports: [],
  templateUrl: './separator.component.html',
  styleUrl: './separator.component.sass',
})
export class SeparatorComponent {
  @Input() space: number = 0
  @Input() word?: string
}
