import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { trigger, style, transition, animate } from '@angular/animations'
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms'
import { MarkdownComponent } from 'ngx-markdown'

@Component({
  selector: 'polo-game-node',
  standalone: true,
  imports: [ReactiveFormsModule, MarkdownComponent],
  templateUrl: './game-node.component.html',
  styleUrl: './game-node.component.sass',
  animations: [
    trigger('showAnswers', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class GameNodeComponent {
  @ViewChild('node') node!: ElementRef
  @ViewChild('textContainer') textContainer!: ElementRef
  @Input() data!: any
  @Input() disabled: boolean = false
  @Output() onSelectAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onContinue: EventEmitter<any> = new EventEmitter()
  @Output() onGoToLink: EventEmitter<any> = new EventEmitter()
  @Output() onShare: EventEmitter<any> = new EventEmitter()
  @Output() typingComplete: EventEmitter<void> = new EventEmitter()

  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent) {
    // Accelerate appearing of content some day
  }

  // Text nodes
  userText = new FormControl('', [
    Validators.required,
    Validators.maxLength(100),
  ])

  showAnswers: boolean = true

  constructor(public activeStory: ActiveStoryService) {}

  // Text node
  continue(event: Event) {
    if (!this.userText.valid) return
    this.markAsSelected(event)
    this.onContinue.emit({
      property: this.data.userTextOptions.property,
      value: this.userText.value,
      join: this.data.join,
    })
  }

  // Others
  getNativeElement(): HTMLElement {
    return this.node?.nativeElement
  }

  markAsSelected(event: any) {
    event.target.classList.add('selected')
  }
}
