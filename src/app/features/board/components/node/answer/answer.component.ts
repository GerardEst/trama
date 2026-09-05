import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core'
import { PanzoomService } from 'src/app/features/board/services/panzoom.service'
import { answer_requirement, event } from 'src/app/core/interfaces/interfaces'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { NodeEventsComponent } from '../node-events/node-events.component'
import { NodeRequirementsComponent } from '../node-requirements/node-requirements.component'
import { StoryEditorService } from '../../../services/story-editor.service'
import { BoardAnchorDirective } from '../../../directives/board-anchor.directive'

@Component({
  selector: 'polo-answer',
  standalone: true,
  imports: [
    NodeEventsComponent,
    BasicButtonComponent,
    NodeRequirementsComponent,
    BoardAnchorDirective,
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
  @ViewChild('textarea') textarea?: ElementRef<HTMLTextAreaElement>

  constructor(
    private storyEditor: StoryEditorService,
    private panzoom: PanzoomService
  ) {}

  ngOnInit() {
    this.events = this.storyEditor.getEventsOfAnswer(this.answerId)
    this.requirements = this.storyEditor.getRequirementsOfAnswer(this.answerId)

    if (this.panzoom.focusElements) {
      setTimeout(() => {
        const textarea = this.textarea
        if (textarea) textarea.nativeElement.focus()
      }, 0)
    }
  }

  saveAnswerText(event: Event) {
    const text = (event.target as HTMLTextAreaElement).value
    this.storyEditor.updateAnswerText(this.answerId, text)
  }

  removeAnswer() {
    this.onRemoveAnswer.emit(this.answerId)
  }
}
