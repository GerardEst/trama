import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/core/services/database.service'
import { StadisticsService } from 'src/app/shared/services/stadistics.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/shared/components/ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { stat } from 'src/app/core/interfaces/interfaces'

@Component({
  selector: 'polo-stadistics',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent, SeparatorComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.sass'],
})
export class StatisticsComponent implements OnInit {
  @Input() storyId!: string
  historyName?: string
  games: any
  statRefs: any

  constructor(
    private db: DatabaseService,
    private stadistics: StadisticsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setBasicStoryInfo()
    this.getStadistics()
  }

  async setBasicStoryInfo() {
    const basicInfo = await this.db.getStoryWithID(this.storyId, true)
    this.historyName = basicInfo.name
  }

  async getStadistics() {
    if (!this.storyId) {
      console.error('No tree selected')
      return
    }

    this.statRefs = await this.db.getRefsOfTree(this.storyId)
    this.games = await this.stadistics.getGamesOf(this.storyId)
  }

  getStatAmount(game: any, stat: any) {
    const amount = game.result.stats.find(
      (gameStat: any) => gameStat.id === stat.id
    )?.amount

    return amount
  }

  getConditionValue(game: any, condition: any) {
    const isConditionPresent = game.result.conditions.find(
      (gameStat: any) => gameStat.id === condition.id
    )

    return !!isConditionPresent ? '✅' : '❌'
  }

  normalizeDate(date: Date) {
    return new Date(date).toLocaleString()
  }

  goBack() {
    this.router.navigate(['/dashboard'])
  }
}
