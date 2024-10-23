import { Component } from '@angular/core'
import { ModalWindowComponent } from 'src/app/components/ui/modal-window/modal-window.component'

@Component({
  selector: 'polo-share-story',
  standalone: true,
  imports: [ModalWindowComponent],
  templateUrl: './share-story.component.html',
  styleUrl: './share-story.component.sass',
})
export class ShareStoryComponent {}
