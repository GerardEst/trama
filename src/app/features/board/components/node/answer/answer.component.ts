import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { AnswerDisplaySelectComponent } from 'src/app/shared/components/answer-display-select/answer-display-select.component'
import { answer_requirement, event, UnavailableAnswerDisplay } from 'src/app/core/interfaces/interfaces'
import { AnchoredPopoverComponent } from 'src/app/shared/components/ui/anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from 'src/app/shared/components/ui/anchored-popover/anchored-popover-content.directive'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
import { NodeAddRequirementComponent } from '../context-menus/node-add-requirement/node-add-requirement.component'
import { NodeEventsComponent } from '../node-events/node-events.component'
import { NodeRequirementsComponent } from '../node-requirements/node-requirements.component'
import { StoryEditorService } from '../../../services/story-editor.service'
import { EventChange, RequirementChange } from '../../../services/story-logic-changes'
import { BoardAnchorDirective } from '../../../directives/board-anchor.directive'
import { RichTextFieldComponent } from '../../rich-text/rich-text-field.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { SortableHandleComponent } from 'src/app/shared/components/ui/sortable-handle/sortable-handle.component'

@Component({
  selector: 'polo-answer',
  standalone: true,
  imports: [
    AnswerDisplaySelectComponent,
    NodeEventsComponent,
    AnchoredPopoverComponent,
    AnchoredPopoverContentDirective,
    NodeAddEventComponent,
    NodeAddRequirementComponent,
    NodeRequirementsComponent,
    BoardAnchorDirective,
    RichTextFieldComponent,
    TranslatePipe,
    SortableHandleComponent,
  ],
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerComponent {
  @Input() unavailableAnswerDisplay?: UnavailableAnswerDisplay
  @Input() events: event[] = []
  @Input() requirements: answer_requirement[] = []

  @Input() answerId: string = ''
  @Input() text: string = ''
  @Input() hasJoin: boolean = false
  @Input() reorderable = false
  @Output() onRemoveAnswer = new EventEmitter<string>()
  @ViewChild(RichTextFieldComponent) richTextField?: RichTextFieldComponent
  @ViewChild(AnchoredPopoverComponent) optionsPopover!: AnchoredPopoverComponent
  @ViewChild('optionsPanel') optionsPanel?: ElementRef<HTMLElement>

  panel: 'menu' | 'event' | 'requirement' | 'display' = 'menu'

  constructor(
    private storyEditor: StoryEditorService,
    private injector: Injector
  ) {}

  toggleOptions() {
    if (this.optionsPopover.isOpen) this.optionsPopover.close()
    else {
      this.panel = 'menu'
      this.optionsPopover.open()
    }
  }

  showPanel(panel: 'event' | 'requirement' | 'display') {
    if (panel === 'display' && !this.requirements.length) return
    this.panel = panel
    // Replacing the menu must transfer keyboard focus into the new editor.
    afterNextRender(() => {
      this.optionsPanel?.nativeElement.querySelector<HTMLElement>(
        'select, button:not([disabled]), input:not([disabled])'
      )?.focus()
    }, { injector: this.injector })
  }

  onMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      this.optionsPopover.close()
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    event.stopPropagation()
    const items = Array.from(this.optionsPanel!.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    const current = items.indexOf(document.activeElement as HTMLElement)
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[index]?.focus()
  }

  saveEvent(change: EventChange) {
    this.storyEditor.upsertAnswerEvent(this.answerId, change)
  }

  saveRequirement(change: RequirementChange) {
    this.storyEditor.upsertAnswerRequirement(this.answerId, change)
  }

  saveAnswerDisplay(value: UnavailableAnswerDisplay | undefined) {
    this.storyEditor.saveAnswerDisplay(this.answerId, value)
    this.optionsPopover.close()
  }

  openFocusEditor() {
    this.optionsPopover.close()
    this.richTextField?.open()
  }

  focusText() { this.richTextField?.focusPreview() }

  saveAnswerText(html: string) {
    this.storyEditor.updateAnswerText(this.answerId, html)
  }

  removeAnswer() {
    this.optionsPopover.close()
    this.onRemoveAnswer.emit(this.answerId)
  }
}
