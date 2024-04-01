import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'

@Component({
  selector: 'polo-condition',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './condition.component.html',
  styleUrl: './condition.component.sass',
})
export class ConditionComponent {
  @Input() fallback: boolean = false
  @Input() nodeId: string = ''
  @Input() selectedRef: string = ''
  @Input() comparator: string = ''
  @Input() value: string = '0'
  @Output() onRemoveCondition: EventEmitter<any> = new EventEmitter()
  @Output() onWillJoin: EventEmitter<any> = new EventEmitter()
  @ViewChild('optionsContainer', { read: ViewContainerRef })
  optionsContainer?: ViewContainerRef

  constructor(
    public activeStory: ActiveStoryService,
    public elementRef: ElementRef
  ) {}

  saveCondition(event: any) {
    const id = this.elementRef.nativeElement.id

    if (event.target.id === 'ref') {
      this.selectedRef = event.target.selectedOptions[0].id
    } else if (event.target.id === 'comparator') {
      this.comparator = event.target.selectedOptions[0].id
    } else if (event.target.id === 'value') {
      this.value = event.target.value
    }

    this.activeStory.updateConditionValues(id, {
      id,
      ref: this.selectedRef,
      comparator: this.comparator,
      value: this.value.toString(),
    })
  }

  willJoin() {
    this.onWillJoin.emit(this.elementRef.nativeElement.id)
  }

  removeCondition() {
    const id = this.elementRef.nativeElement.id

    this.onRemoveCondition.emit(id)
  }
}
