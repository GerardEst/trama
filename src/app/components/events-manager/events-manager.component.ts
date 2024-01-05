import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DropdownButtonsComponent } from '../ui/dropdown-button/dropdown-buttons.component'
import { StorageService } from 'src/app/services/storage.service'
import { EventComponent } from '../event/event.component'

@Component({
  selector: 'polo-events-manager',
  standalone: true,
  imports: [CommonModule, DropdownButtonsComponent, EventComponent],
  templateUrl: './events-manager.component.html',
  styleUrls: ['./events-manager.component.sass'],
})
export class EventsManagerComponent {
  events: Array<any> = []
  @Input() answerId: string = ''

  constructor(private storage: StorageService) {}

  ngOnInit() {
    if (this.answerId) {
      this.events = this.storage.getEventsOfAnswer(this.answerId) || []
    }
    console.log(this.events)
  }

  createEvent(action: 'alterStat' | 'alterCondition' | 'win' | 'end') {
    this.events.push({
      amount: 1,
      action,
    })
  }

  updateEventElement(element: any) {
    const event = this.events.find(
      (event) => event.target === element.previousValue
    )
    if (event) event.target = element.value

    this.storage.saveAnswerEvents(this.answerId, this.events)
  }

  updateEventAmount(options: any) {
    console.log(options)
    const eventId = options.id
    const amount = parseInt(options.value)

    const event = this.events.find((event) => event.target === eventId)
    if (event) event.amount = amount

    this.storage.saveAnswerEvents(this.answerId, this.events)
  }

  deleteEvent(eventTarget: string) {
    console.log(eventTarget)
    console.log(this.events)
    this.events = this.events.filter((event: any) => {
      return event.target !== eventTarget
    })
    this.storage.deleteEventFromAnswer(this.answerId, eventTarget)
  }
}
