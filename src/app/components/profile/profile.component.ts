import { Component, Input } from '@angular/core'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'
import { ModalService } from 'src/app/services/modal.service'
import { ProfileModalComponent } from '../profile-modal/profile-modal.component'

@Component({
  selector: 'polo-profile',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass',
})
export class ProfileComponent {
  @Input() username?: string
  @Input() userplan?: string

  constructor(private modal: ModalService) {}

  openProfile() {
    this.modal.launch(ProfileModalComponent)
  }

  upgradePlan() {}
}
