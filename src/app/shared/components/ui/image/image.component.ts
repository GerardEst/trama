import { Component, Input, Output, EventEmitter, inject } from '@angular/core'
import { BasicButtonComponent } from '../basic-button/basic-button.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { STORY_IMAGE_URL } from './story-image-url'

@Component({
  selector: 'polo-image',
  standalone: true,
  imports: [BasicButtonComponent, TranslatePipe],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css',
})
export class ImageComponent {
  @Input() storageRoute?: string
  @Input() loadingMessage?: string
  @Input() loading: boolean = false
  @Input() canDelete?: boolean = false

  @Output() onRemoveImage: EventEmitter<any> = new EventEmitter()
  /** The picture has arrived and now takes its room. */
  @Output() loaded = new EventEmitter<void>()

  private readonly imageUrl = inject(STORY_IMAGE_URL)

  get source(): string | undefined {
    return this.storageRoute ? this.imageUrl(this.storageRoute) : undefined
  }
}
