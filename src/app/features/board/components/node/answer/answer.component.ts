import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core'
import { answer_requirement, event } from 'src/app/core/interfaces/interfaces'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { NodeEventsComponent } from '../node-events/node-events.component'
import { NodeRequirementsComponent } from '../node-requirements/node-requirements.component'
import { StoryEditorService } from '../../../services/story-editor.service'
import { BoardAnchorDirective } from '../../../directives/board-anchor.directive'
import { RichTextFieldComponent } from '../../rich-text/rich-text-field.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-answer',
  standalone: true,
  imports: [
    NodeEventsComponent,
    BasicButtonComponent,
    NodeRequirementsComponent,
    BoardAnchorDirective,
    RichTextFieldComponent,
    TranslatePipe,
  ],
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerComponent implements OnInit {
  events: Array<event> = []
  requirements: answer_requirement[] = []

  @Input() answerId: string = ''
  @Input() text: string = ''
  @Input() hasJoin: boolean = false
  @Output() onRemoveAnswer = new EventEmitter<string>()
  @ViewChild(RichTextFieldComponent) richTextField?: RichTextFieldComponent

  constructor(
    private storyEditor: StoryEditorService
  ) {}

  ngOnInit() {
    this.events = this.storyEditor.getEventsOfAnswer(this.answerId)
    this.requirements = this.storyEditor.getRequirementsOfAnswer(this.answerId)
  }

  focusText() { this.richTextField?.focusPreview() }

  saveAnswerText(html: string) {
    this.storyEditor.updateAnswerText(this.answerId, html)
  }

  removeAnswer() {
    this.onRemoveAnswer.emit(this.answerId)
  }
}
