import { Component, Output, Input, EventEmitter } from '@angular/core'
import { NodeAddRequirementComponent } from '../../context-menus/node-add-requirement/node-add-requirement.component'
import { AnchoredPopoverComponent } from 'src/app/shared/components/ui/anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from 'src/app/shared/components/ui/anchored-popover/anchored-popover-content.directive'
import { StoryReferencesService } from 'src/app/features/board/services/story-references.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'

@Component({
  selector: 'polo-node-requirement',
  standalone: true,
  imports: [
    AnchoredPopoverComponent,
    AnchoredPopoverContentDirective,
    NodeAddRequirementComponent,
    TranslatePipe,
  ],
  templateUrl: './node-requirement.component.html',
  styleUrl: './node-requirement.component.css',
})
export class NodeRequirementComponent {
  constructor(
    private storyReferences: StoryReferencesService,
    private i18n: I18nService
  ) {}

  @Output() onSaveRequirement: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteRequirement: EventEmitter<any> = new EventEmitter()

  @Input() type: 'stat' | 'condition' = 'stat'
  @Input() amount!: string
  @Input() target!: string

  openModifyRequirement: boolean = false

  get displayTarget() {
    const referenceName = this.storyReferences.getName(this.target)
    if (referenceName) return referenceName

    return (this.target || '')
      .replace(/^(stat|condition|property)_/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/^\w/, (letter) => letter.toUpperCase())
  }

  get displayValue() {
    if (this.type === 'condition') {
      return this.i18n.t(Number(this.amount) ? 'board.requirement.required' : 'board.requirement.mustBeOff')
    }

    return `≥ ${this.amount}`
  }

  saveRequirement(event: any) {
    this.onSaveRequirement.emit({
      ...event,
      previousValue: this.target,
    })
  }

  deleteRequirement(event: any) {
    this.onDeleteRequirement.emit(event.target)
  }
}
