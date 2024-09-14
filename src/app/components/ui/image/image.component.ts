import { Component, Input, Output, EventEmitter } from '@angular/core'
import { BasicButtonComponent } from '../basic-button/basic-button.component'

@Component({
  selector: 'polo-image',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './image.component.html',
  styleUrl: './image.component.sass',
})
export class ImageComponent {
  @Input() storageRoute?: string
  @Input() loadingMessage?: string
  @Input() loading: boolean = false
  @Input() canDelete?: boolean = false

  @Output() onRemoveImage: EventEmitter<any> = new EventEmitter()
}
