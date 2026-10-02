import { Component, Input } from '@angular/core'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-google-login',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.sass',
})
export class GoogleLoginComponent {
  @Input() isRegistering: boolean = false
}
