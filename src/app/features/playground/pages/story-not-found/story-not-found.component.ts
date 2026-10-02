import { Component } from '@angular/core'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-story-not-found',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './story-not-found.component.html',
  styleUrl: './story-not-found.component.sass',
})
export class StoryNotFoundComponent {}
