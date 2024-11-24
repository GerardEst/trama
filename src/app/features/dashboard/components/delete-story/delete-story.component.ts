import { Component } from '@angular/core'
import { AlertWindowComponent } from 'src/app/shared/components/ui/alert-window/alert-window.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { AlertService } from 'src/app/core/services/alert.service'

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
