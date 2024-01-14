import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DatabaseService } from '../../services/database.service'

@Component({
  selector: 'polo-stadistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stadistics.component.html',
  styleUrls: ['./stadistics.component.sass'],
})
export class StadisticsComponent implements OnInit {
  plays: any
  refs: any
  treeId?: number
  @Input() set id(treeId: number) {
    this.treeId = treeId
  }

  constructor(private db: DatabaseService) {}

  ngOnInit() {
    this.getStadistics()
  }

  async getStadistics() {
    if (!this.treeId) {
      console.warn('No tree selected')
      return
    }

    this.refs = await this.db.getRefsOfTree(this.treeId)
    this.plays = await this.db.getStadisticsOfTree(this.treeId)

    console.log(this.refs)
    console.log(this.plays)
  }

  getRefName(id: number) {
    return this.refs[id]?.name
  }

  normalizeDate(date: Date) {
    return new Date(date).toLocaleString()
  }
}
