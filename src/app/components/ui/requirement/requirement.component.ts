import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  Input,
} from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'polo-requirement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.sass'],
})
export class RequirementComponent implements AfterViewInit {
  @ViewChild('name') name?: ElementRef
  @ViewChild('amount') amount?: ElementRef
  @Output() updateName: EventEmitter<any> = new EventEmitter()
  @Output() updateAmount: EventEmitter<any> = new EventEmitter()
  @Output() deleted: EventEmitter<any> = new EventEmitter()
  @Input() id?: string
  @Input() type?: string
  @Input() requirementName?: string
  @Input() requirementAmount?: number

  ngAfterViewInit() {
    // this.name?.nativeElement.focus()
  }
  changeName(event: any) {
    this.updateName.emit({ id: this.id, value: event.target.value })
  }

  changeAmount(event: any) {
    this.updateAmount.emit({ id: this.id, value: event.target.value })
  }

  removeRequirement() {
    this.deleted.emit(this.id)
  }
}
