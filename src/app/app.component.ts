import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterOutlet } from '@angular/router'
import { ActiveStoryTitleService } from './shared/services/active-story-title.service'

@Component({
  selector: 'polo-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  constructor() {
    inject(ActiveStoryTitleService)
  }
}
