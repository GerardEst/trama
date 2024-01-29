import { Component, OnInit, Input } from '@angular/core'
import { TreeErrorNotifierComponent } from '../tree-error-notifier/tree-error-notifier.component'
import { DatabaseService } from 'src/app/services/database.service'

@Component({
  selector: 'polo-menu-top',
  standalone: true,
  imports: [TreeErrorNotifierComponent],
  templateUrl: './menu-top.component.html',
  styleUrl: './menu-top.component.sass',
})
export class MenuTopComponent {
  @Input() storyName?: string
  savingTree = false

  constructor(private db: DatabaseService) {}

  async updateStoryName($event: any) {
    const storyId = localStorage.getItem('polo-id')
    const newName = $event.target.value.trim()
    if (!storyId || newName.length === 0) return

    await this.db.saveNewStoryName(storyId, $event.target.value)
  }

  async saveToDb(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.savingTree = true
      this.db.saveLocalToDB().then((resp) => {
        console.log('Saved?', resp)
        setTimeout(() => {
          this.savingTree = false
          resolve() // Resolve the promise when saving is complete
        }, 200)
      })
    })
  }
}
