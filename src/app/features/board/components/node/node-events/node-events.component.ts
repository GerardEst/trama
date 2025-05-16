import { Component, Inject, Input } from '@angular/core'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
import { event } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { NodeEventComponent } from '../node-event/node-event.component'

@Component({
  selector: 'polo-node-events',
  standalone: true,
  imports: [BasicButtonComponent, NodeAddEventComponent, NodeEventComponent],
  templateUrl: './node-events.component.html',
  styleUrl: './node-events.component.sass',
})
export class NodeEventsComponent {
  // La llista dels events que hi ha al node
  // Podria rebre tota la lògica aquí i que aquet fos el que gestiona, aixi podria modificar la llista en directe

  @Inject(ActiveStoryService) private activeStory!: ActiveStoryService
  @Input() nodeId!: string
  @Input() events?: Array<event>

  openAddEvent: boolean = false

  modifyEvent(event: any) {
    console.log(event)
    if (!this.events) return

    // Modificar l'event
    this.events = this.events.map((e) => {
      if (e.id === event.eventId) {
        e.amount = event.eventAmount
      }
      return e
    })

    this.activeStory.saveNodeEvents(this.nodeId, this.events)
  }

  createNewEvent(event: any) {
    console.log(event)

    const newEvent = {
      id: event.eventId,
      amount: event.eventAmount,
    }

    this.events?.push(event)

    this.activeStory.saveNodeEvents(this.nodeId, this.events)
  }
}
