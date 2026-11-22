import { Component, EventEmitter, Input, Output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

/** For an author without stories: the first story to start, or the example, beside one of the landing's landscapes. */
@Component({
  selector: 'polo-first-steps',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './first-steps.component.html',
  host: { role: 'region', 'aria-labelledby': 'first-steps-title' },
  styleUrl: './first-steps.component.css',
})
export class FirstStepsComponent {
  @Input() creating = false
  /** The author asks for a blank story; the page creates it and opens it. */
  @Output() readonly create = new EventEmitter<void>()
}
