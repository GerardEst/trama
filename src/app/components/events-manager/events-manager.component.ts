import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DropdownButtonsComponent } from '../ui/dropdown-button/dropdown-buttons.component'
import { StorageService } from 'src/app/services/storage.service'
import { EventComponent } from '../ui/event/event.component'

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

  /** Els events potser van diferent...
   * Es pot afegir varis tipus d'events predefinits:
   * alterStat,
   * alterCondition,
   * win,
   * end
   *
   * en una mateixa answer hi pot haber varis i repetits però amb
   * repercusions diferents
   *
   * - S'ha de poder triar d'entre una llista el tipus d'event
   * - S'afegeix a la llista
   * - Cada event després té opcions que podem alterar
   * - A la hora de borrar o editar un event, necessitem referir-nos a ell
   * per tant cada event a de tenir un id, però aquesta vegada res a veure amb marco
   * es nomes algo per tenir control a polo.
   */
  constructor(private storage: StorageService) {}

  ngOnInit() {
    if (this.answerId) {
      this.events = this.storage.getEventsOfAnswer(this.answerId) || []
    }
  }

  createEvent(ref: 'alterStat' | 'alterCondition' | 'win' | 'end') {
    const id = this.answerId + '_event_' + new Date().getTime()
    const target = 'exp'
    const amount = 1
    this.events.push({
      id,
      ref,
      target,
      amount,
    })
    this.storage.addEventToAnswer(this.answerId, {
      id,
      ref,
      target,
      amount,
    })
  }

  deleteEvent(eventId: Event) {
    this.events = this.events.filter((event: any) => {
      return event.id !== eventId
    })
    this.storage.deleteEventFromAnswer(this.answerId, eventId)
  }
}
