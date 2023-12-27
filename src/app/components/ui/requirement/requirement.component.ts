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
  @Output() updated: EventEmitter<any> = new EventEmitter()
  @Input() type?: string
  @Input() requirementName?: string
  @Input() requirementAmount?: number

  ngAfterViewInit() {
    // this.name?.nativeElement.focus()
  }
  changeName() {
    this.updated.emit({
      name: this.name?.nativeElement.value,
      amount: this.amount?.nativeElement.value,
      type: this.type,
    })
  }

  changeAmount() {
    this.updated.emit({
      name: this.name?.nativeElement.value,
      amount: this.amount?.nativeElement.value,
      type: this.type,
    })
  }

  removeRequirement() {
    console.log('delete requirement')
  }
}
