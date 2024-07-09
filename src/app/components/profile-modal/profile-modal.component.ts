import { Component } from '@angular/core'
import { ModalWindowComponent } from '../ui/modal-window/modal-window.component'
import { BasicButtonComponent } from '../ui/basic-button/basic-button.component'
import { DatabaseService } from 'src/app/services/database.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { StadisticsService } from 'src/app/services/stadistics.service'
import { Router } from '@angular/router'

@Component({
  selector: 'polo-profile-modal',
  standalone: true,
  imports: [ModalWindowComponent, BasicButtonComponent],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.sass',
})
export class ProfileModalComponent {
  constructor(
    private db: DatabaseService,
    private activeStory: ActiveStoryService,
    private stadistics: StadisticsService,
    private router: Router
  ) {}

  logout() {
    this.db.supabase.auth.signOut()
    this.db.user = null
    this.activeStory.reset()
    this.stadistics.clean()
    localStorage.removeItem('polo-id')
    localStorage.removeItem('polo-activeNodes')

    this.router.navigate(['/login'])
  }
}
