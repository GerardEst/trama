import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  OnInit,
} from '@angular/core'
import { StoryEditorService } from '../../services/story-editor.service'
import { StoryReferencesService } from '../../services/story-references.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { ref } from 'src/app/core/interfaces/interfaces'
import { BoardAnchorDirective } from '../../directives/board-anchor.directive'

@Component({
  selector: 'polo-condition',
  standalone: true,
  imports: [BasicButtonComponent, BoardAnchorDirective],
  templateUrl: './condition.component.html',
  styleUrl: './condition.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionComponent implements OnInit {
  refOptions: ref[] = []
  refType: 'stat' | 'condition' | 'property' = 'stat'

  // Inputs to start with
  @Input() conditionId: string = ''
  @Input() fallback: boolean = false
  @Input() selectedRef: string = ''
  @Input() comparator: string = ''
  @Input() value: number = 0
  @Input() hasJoin: boolean = false

  @Output() onRemoveCondition = new EventEmitter<string>()
  @ViewChild('optionsContainer', { read: ViewContainerRef })
  optionsContainer?: ViewContainerRef

  constructor(
    private storyEditor: StoryEditorService,
    private storyReferences: StoryReferencesService
  ) {}

  ngOnInit() {
    this.refOptions = Object.entries(this.storyReferences.getAll()).map(
      ([id, storyRef]) => ({ id, ...storyRef })
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
    } else if (event.target.id === 'comparator') {
      this.comparator = event.target.selectedOptions[0].id
    } else if (event.target.id === 'value') {
      this.value = event.target.value
    }

    this.storyEditor.updateConditionValues(this.conditionId, {
      id: this.conditionId,
      ref: this.selectedRef,
      comparator: this.comparator,
      value: this.value,
    })
  }

  removeCondition() {
    this.onRemoveCondition.emit(this.conditionId)
  }
}
