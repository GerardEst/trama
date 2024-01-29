import { Component, OnInit, Input } from '@angular/core'
import { TreeErrorNotifierComponent } from '../tree-error-notifier/tree-error-notifier.component'
import { DatabaseService } from 'src/app/services/database.service'
import { Router } from '@angular/router'

@Component({
  selector: 'polo-menu-top',
  standalone: true,
  imports: [TreeErrorNotifierComponent],
  templateUrl: './menu-top.component.html',
  styleUrl: './menu-top.component.sass',
})
export class MenuTopComponent {
  @Input() storyName?: string
  @Input() treeId?: string
  options = false
  savingTree = false
  trackingEnabled: boolean = false
  bookviewEnabled: boolean = false

  constructor(private db: DatabaseService, private router: Router) {}

  ngOnInit(): void {
    this.updateConfiguration()
  }

  async updateStoryName($event: any) {
    const storyId = localStorage.getItem('polo-id')
    const newName = $event.target.value.trim()
    if (!storyId || newName.length === 0) return

    await this.db.saveNewStoryName(storyId, $event.target.value)
  }

  toggleOptions() {
    this.options = !this.options
  }

  toggleTracking() {
    if (this.treeId) {
      this.trackingEnabled = !this.trackingEnabled
      this.db.setTrackingOf(this.treeId, this.trackingEnabled)
    }
  }
  toggleBookview() {
    if (this.treeId) {
      this.bookviewEnabled = !this.bookviewEnabled
      this.db.setBookviewOf(this.treeId, this.bookviewEnabled ? 'book' : null)
    }
  }

  async openStadistics() {
    this.router.navigate(['/stadistics', this.treeId])
  }

  async updateConfiguration() {
    if (this.treeId) {
      const configuration = await this.db.getConfigurationOf(this.treeId)
      this.trackingEnabled = configuration.tracking
      this.bookviewEnabled = configuration.view === 'book'
    }
  }

  exportTree() {
    //@ts-ignore
    navigator.clipboard.writeText(localStorage.getItem('polo-tree'))
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
