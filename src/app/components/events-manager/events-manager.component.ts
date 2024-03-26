import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DropdownButtonsComponent } from '../ui/dropdown-button/dropdown-buttons.component'
import { StorageService } from 'src/app/services/storage.service'
import { EventComponent } from '../event/event.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from '../basic-button/basic-button.component'

@Component({
  selector: 'polo-events-manager',
  standalone: true,
  imports: [
    CommonModule,
    DropdownButtonsComponent,
    EventComponent,
    BasicButtonComponent,
  ],
  templateUrl: './events-manager.component.html',
  styleUrls: ['./events-manager.component.sass'],
})
export class EventsManagerComponent {
  events: Array<any> = []
  @Input() answerId: string = ''

  constructor(
    private storage: StorageService,
    private activeStory: ActiveStoryService
  ) {}

  ngOnInit() {
    if (this.answerId) {
      this.events = this.storage.getEventsOfAnswer(this.answerId) || []
    }
  }

  createEvent(action: 'alterStat' | 'alterCondition') {
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
    this.activeStory.addRef(
      'event',
      {
        id: element.value,
        answer: this.answerId,
      },
      {
        id: element.previousValue,
        answer: this.answerId,
      }
    )
  }

  updateEventAmount(options: any) {
    const eventId = options.id
    const amount = parseInt(options.value)

    const event = this.events.find((event) => event.target === eventId)
    if (event) event.amount = amount

    this.storage.saveAnswerEvents(this.answerId, this.events)
  }

  deleteEvent(eventId: string) {
    this.events = this.events.filter((event: any) => {
      return event.target !== eventId
    })
    this.storage.deleteEventFromAnswer(this.answerId, eventId)
    this.activeStory.removeRef('event', {
      id: eventId,
      answer: this.answerId,
    })
  }
}
