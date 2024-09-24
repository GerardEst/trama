import { Component } from '@angular/core'
import { AlertWindowComponent } from '../../ui/alert-window/alert-window.component'
import { BasicButtonComponent } from '../../ui/basic-button/basic-button.component'
import { AlertService } from 'src/app/services/alert.service'

@Component({
  selector: 'polo-delete-story',
  standalone: true,
  imports: [AlertWindowComponent, BasicButtonComponent],
  templateUrl: './delete-story.component.html',
  styleUrl: './delete-story.component.sass',
})
export class DeleteStoryComponent {
  resolve: (value: boolean) => void = () => {}
  constructor(private alertService: AlertService) {}

  confirm() {
    this.resolve(true)
    this.alertService.close()
  }
  close() {
    this.resolve(false)
    this.alertService.close()
  }
}
