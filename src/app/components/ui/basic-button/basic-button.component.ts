import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-basic-button',
  standalone: true,
  imports: [],
  templateUrl: './basic-button.component.html',
  styleUrl: './basic-button.component.sass',
})
export class BasicButtonComponent {
  @Input() title?: string | undefined
  @Input() text?: string | undefined
  @Input() icon?: string | undefined
  @Input() size?: 's' | undefined
  @Input() type?: 'danger' | 'success' | undefined

  @Input() transparent: boolean = false
  @Input() iconSize: number = 15
  @Input() disabled: boolean = false
}
