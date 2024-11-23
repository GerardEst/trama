import { Component } from '@angular/core'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ModalService } from 'src/app/shared/services/modal.service'
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component'
import { DatabaseService } from 'src/app/core/services/database.service'

@Component({
  selector: 'polo-profile',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass',
})
export class ProfileComponent {
  constructor(
    private modal: ModalService,
    public db: DatabaseService
  ) {}

  openProfile() {
    this.modal.launch(ProfileModalComponent)
  }
}
