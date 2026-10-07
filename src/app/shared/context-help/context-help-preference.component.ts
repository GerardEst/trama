import { Component, inject } from '@angular/core'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ContextHelpService } from './context-help.service'

let nextPreferenceId = 0

@Component({
  selector: 'polo-context-help-preference',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './context-help-preference.component.html',
  styleUrl: './context-help-preference.component.css',
})
export class ContextHelpPreferenceComponent {
  readonly help = inject(ContextHelpService)
  readonly id = `context-help-preference-${nextPreferenceId++}`
}
