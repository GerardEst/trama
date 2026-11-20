import { Component, inject } from '@angular/core'
import { ThemeService } from 'src/app/shared/services/theme.service'
import { ContextHelpService } from 'src/app/shared/context-help/context-help.service'
import { LanguageSelectorComponent } from 'src/app/shared/components/ui/language-selector/language-selector.component'
import { ToggleComponent } from 'src/app/shared/components/ui/toggle/toggle.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

/** How Trama looks and talks to the person, on this device: the theme, the help and the language. */
@Component({
  selector: 'polo-settings-preferences',
  standalone: true,
  imports: [LanguageSelectorComponent, ToggleComponent, TranslatePipe],
  templateUrl: './preferences.component.html',
  styleUrl: '../../../../shared/layout/page.css',
})
export class PreferencesComponent {
  readonly theme = inject(ThemeService)
  readonly help = inject(ContextHelpService)
}
