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
  @Output() created: EventEmitter<any> = new EventEmitter()
  @Input() type?: string
  @Input() requirementName?: string

  ngAfterViewInit() {
    this.name?.nativeElement.focus()
  }

  checkContent() {
    this.created.emit({
      name: this.name?.nativeElement.value,
      amount: 1,
      type: this.type,
    })
  }

  removeRequirement() {
    console.log('delete requirement')
  }
}
