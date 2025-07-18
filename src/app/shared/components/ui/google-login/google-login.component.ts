import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-google-login',
  standalone: true,
  imports: [],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.sass',
})
export class GoogleLoginComponent {
  @Input() isRegistering: boolean = false
}
