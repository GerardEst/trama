import { Component, Input, EventEmitter, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { SharedBoardService } from 'src/app/services/shared-board-service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
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

  constructor(
    private activeStory: ActiveStoryService,
    private sharedBoardService: SharedBoardService
  ) {}

  unlinkJoin(joinId: string) {
    if (!this.answerId) return

    const updatedJoins = this.activeStory.removeJoinFromAnswer(
      this.answerId,
      joinId
    )

    this.sharedBoardService.updatedJoins.next({
      answerId: this.answerId,
      joins: updatedJoins,
    })

    this.onRemoveJoin.emit(updatedJoins)
  }
}
