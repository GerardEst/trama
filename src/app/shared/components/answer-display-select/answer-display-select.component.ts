import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { UnavailableAnswerDisplay } from 'src/app/core/interfaces/interfaces'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ActiveStoryService } from '../../services/active-story.service'
import { answerDisplay } from '../../utils/answer-display'

@Component({
  selector: 'polo-answer-display-select',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './answer-display-select.component.html',
  styleUrl: './answer-display-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerDisplaySelectComponent {
  @Input() value?: UnavailableAnswerDisplay
  @Input() inherit = false
  @Output() changed = new EventEmitter<UnavailableAnswerDisplay | undefined>()

  constructor(private story: ActiveStoryService) {}

  get inherited() { return answerDisplay(this.story.entireTree().unavailableAnswerDisplay) }

  get inheritedLabel(): TranslationKey { return `common.answerDisplay.${this.inherited}` }

  change(event: Event) {
    const value = (event.target as HTMLSelectElement).value
    this.changed.emit(value === 'inherit' ? undefined : answerDisplay(value))
  }
}
