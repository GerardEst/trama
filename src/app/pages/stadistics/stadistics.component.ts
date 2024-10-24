import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from '../../services/database.service'
import { StadisticsService } from 'src/app/services/stadistics.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/components/ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Component({
  selector: 'polo-stadistics',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent, SeparatorComponent],
  templateUrl: './stadistics.component.html',
  styleUrls: ['./stadistics.component.sass'],
})
export class StadisticsComponent implements OnInit {
  @Input() storyId!: string
  historyName?: string
  plays: any
  refs: any

  constructor(
    private db: DatabaseService,
    private stadistics: StadisticsService,
    private router: Router,
    private activeStory: ActiveStoryService
  ) {}

  ngOnInit() {
    // TODO - Si l'activeStory es el mateix que volem, pillem la basicInfo d'allà
    if (this.activeStory.storyId() === this.storyId) {
      this.setBasicStoryInfo()
    } else {
      console.log(this.activeStory.storyId())
      console.log(this.activeStory.storyName())
      this.historyName = this.activeStory.storyName()
    }
    this.getStadistics()
  }

  async setBasicStoryInfo() {
    const basicInfo = await this.db.getStoryWithID(this.storyId, true)
    console.log(basicInfo)
    this.historyName = basicInfo.name
  }

  async getStadistics() {
    if (!this.storyId) {
      console.error('No tree selected')
      return
    }

    this.refs = await this.db.getRefsOfTree(this.storyId)
    this.plays = await this.stadistics.getGamesOf(this.storyId)
  }

  getRefName(id: number) {
    return this.refs[id]?.name
  }

  normalizeDate(date: Date) {
    return new Date(date).toLocaleString()
  }

  goBack() {
    this.router.navigate(['/dashboard'])
  }
}
