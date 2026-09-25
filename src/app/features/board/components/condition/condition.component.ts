import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
} from '@angular/core'
import { StoryEditorService } from '../../services/story-editor.service'
import { StoryReferencesService } from '../../services/story-references.service'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { node_condition_rule, ref } from 'src/app/core/interfaces/interfaces'
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

  @Input() conditionId: string = ''
  @Input() fallback: boolean = false
  @Input() selectedRef: string = ''
  @Input() comparator: string = ''
  @Input() value: number = 0
  @Input() rules?: node_condition_rule[]
  @Input() routeNumber: number = 1
  @Input() routeCount: number = 1
  @Input() hasJoin: boolean = false

  @Output() onRemoveCondition = new EventEmitter<string>()
  @Output() moveRoute = new EventEmitter<-1 | 1>()

  constructor(
    private storyEditor: StoryEditorService,
    private storyReferences: StoryReferencesService
  ) {}

  ngOnInit() {
    this.refOptions = Object.entries(this.storyReferences.getAll()).map(
      ([id, storyRef]) => ({ id, ...storyRef })
    )
  }

  get displayedRules(): node_condition_rule[] {
    return (
      this.rules ?? [
        {
          ref: this.selectedRef,
          comparator: this.comparator,
          value: this.value,
        },
      ]
    )
  }

  isProperty(refId?: string) {
    return this.refOptions.some(
      (ref) => ref.id === refId && ref.type === 'property'
    )
  }

  saveCondition(event: Event, rule: node_condition_rule, ruleIndex: number) {
    const target = event.target as HTMLSelectElement | HTMLInputElement
    const values = { ...rule }
    if (target.id === 'ref') {
      values.ref = (target as HTMLSelectElement).selectedOptions[0].id
    }
    if (target.id === 'comparator') {
      values.comparator = (target as HTMLSelectElement).selectedOptions[0].id
    }
    if (target.id === 'value') values.value = Number(target.value)

    this.storyEditor.updateConditionValues(this.conditionId, values, ruleIndex)
  }

  addRule() {
    this.storyEditor.addConditionRule(this.conditionId)
  }

  removeRule(index: number) {
    this.storyEditor.removeConditionRule(this.conditionId, index)
  }

  removeCondition() {
    this.onRemoveCondition.emit(this.conditionId)
  }
}
