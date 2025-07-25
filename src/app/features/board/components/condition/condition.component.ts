import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ref } from 'src/app/core/interfaces/interfaces'

@Component({
  selector: 'polo-condition',
  standalone: true,
  imports: [BasicButtonComponent],
  templateUrl: './condition.component.html',
  styleUrl: './condition.component.sass',
})
export class ConditionComponent {
  id: string = ''
  refOptions: ref[] = []
  refType: 'stat' | 'condition' | 'property' = 'stat'

  // Inputs to start with
  @Input() fallback: boolean = false
  @Input() selectedRef: string = ''
  @Input() comparator: string = ''
  @Input() value: number = 0
  @Input() hasJoin: boolean = false

  @Output() onRemoveCondition: EventEmitter<any> = new EventEmitter()
  @ViewChild('optionsContainer', { read: ViewContainerRef })
  optionsContainer?: ViewContainerRef

  constructor(
    public activeStory: ActiveStoryService,
    public elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.id = this.elementRef.nativeElement.id
    this.refOptions = Object.keys(this.activeStory.entireTree().refs).map(
      (refId) => {
        return {
          id: refId,
          name: this.activeStory.entireTree().refs[refId].name,
          type: this.activeStory.entireTree().refs[refId].type,
        }
      }
    )
    this.refType = this.refOptions.find((ref) => ref.id === this.selectedRef)
      ?.type as 'stat' | 'condition' | 'property'
  }
  saveCondition(event: any) {
    if (event.target.id === 'ref') {
      this.refType = this.refOptions.find(
        (ref) => ref.id === event.target.selectedOptions[0].id
      )?.type as 'stat' | 'condition' | 'property'
      this.selectedRef = event.target.selectedOptions[0].id
      console.log('this.refType', this.refType)
    } else if (event.target.id === 'comparator') {
      this.comparator = event.target.selectedOptions[0].id
    } else if (event.target.id === 'value') {
      this.value = event.target.value
    }

    this.activeStory.updateConditionValues(this.id, {
      id: this.id,
      ref: this.selectedRef,
      comparator: this.comparator,
      value: this.value,
    })
  }

  removeCondition() {
    this.onRemoveCondition.emit(this.id)
  }
}
