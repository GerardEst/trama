import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from 'src/app/core/services/database.service'
import { StatisticsService } from 'src/app/shared/services/statistics.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { Router } from '@angular/router'
import { SeparatorComponent } from 'src/app/shared/components/ui/separator/separator.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { stat } from 'src/app/core/interfaces/interfaces'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'

@Component({
  selector: 'polo-stadistics',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent, SeparatorComponent, TranslatePipe],
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
    private stadistics: StatisticsService,
    private router: Router,
    private i18n: I18nService
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

    return isConditionPresent ? '✅' : '❌'
  }

  normalizeDate(date: Date) {
    return this.i18n.formatDate(date, { dateStyle: 'short', timeStyle: 'short' })
  }

  goBack() {
    this.router.navigate(['/dashboard'])
  }
}
