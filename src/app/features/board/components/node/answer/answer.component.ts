import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { PanzoomService } from 'src/app/features/board/services/panzoom.service'
import { answer_requirement, event } from 'src/app/core/interfaces/interfaces'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { NodeEventsComponent } from '../node-events/node-events.component'
import { NodeRequirementsComponent } from '../node-requirements/node-requirements.component'
import { StoryEditorService } from '../../../services/story-editor.service'

@Component({
  selector: 'polo-answer',
  standalone: true,
  imports: [
    CommonModule,
    NodeEventsComponent,
    BasicButtonComponent,
    NodeRequirementsComponent,
  ],
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.sass'],
})
export class AnswerComponent implements OnInit {
  id: string = ''
  events: Array<event> = []
  requirements: answer_requirement[] = []

  @Input() text: string = ''
  @Input() hasJoin: boolean = false
  @Output() onRemoveAnswer: EventEmitter<any> = new EventEmitter()
  @ViewChild('textarea') textarea?: ElementRef

  constructor(
    private storyEditor: StoryEditorService,
    public elementRef: ElementRef,
    private panzoom: PanzoomService
  ) {}

  ngOnInit() {
    this.id = this.elementRef.nativeElement.id
    this.events = this.storyEditor.getEventsOfAnswer(this.id)
    this.requirements = this.storyEditor.getRequirementsOfAnswer(this.id)

    if (this.panzoom.focusElements) {
      setTimeout(() => {
        const textarea = this.textarea
        if (textarea) textarea.nativeElement.focus()
      }, 0)
    }
  }

  saveAnswerText(e: any) {
    const text = e.target.value
    this.storyEditor.updateAnswerText(this.id, text)
  }

  removeAnswer() {
    this.onRemoveAnswer.emit(this.id)
  }
}
