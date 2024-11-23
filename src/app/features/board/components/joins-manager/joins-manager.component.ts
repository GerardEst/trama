import { Component, Input, EventEmitter, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'

@Component({
  selector: 'polo-joins-manager',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent],
  templateUrl: './joins-manager.component.html',
  styleUrls: ['./joins-manager.component.sass'],
})
export class JoinsManagerComponent {
  @Input() answerId?: string
  @Input() joins: Array<any> = []
  @Output() onRemoveJoin: EventEmitter<any> = new EventEmitter()

  constructor(private activeStory: ActiveStoryService) {}

  unlinkJoin(joinId: string, toAnswer: boolean) {
    if (!this.answerId) return

    const updatedJoins = this.activeStory.removeJoin(
      this.answerId,
      joinId,
      toAnswer
    )

    this.onRemoveJoin.emit(updatedJoins)
  }
}
