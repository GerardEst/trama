import { Component, Input, EventEmitter, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StorageService } from 'src/app/services/storage.service'

@Component({
  selector: 'polo-joins-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './joins-manager.component.html',
  styleUrls: ['./joins-manager.component.sass'],
})
export class JoinsManagerComponent {
  @Input() answerId?: string
  @Input() joins: Array<any> = []
  @Output() onRemoveJoin: EventEmitter<any> = new EventEmitter()

  constructor(private storage: StorageService) {}

  unlinkJoin(joinId: string) {
    if (!this.answerId) return

    const newJoins = this.storage.removeJoinFromAnswer(this.answerId, joinId)

    this.onRemoveJoin.emit(newJoins)
  }
}
