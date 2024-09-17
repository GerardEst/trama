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
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'polo-game-node',
  standalone: true,
  imports: [FormsModule],
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
  @Input() writeSpeed: 'immediate' | 'slow' | 'fast' = 'immediate'
  @Output() onSelectAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onContinue: EventEmitter<any> = new EventEmitter()
  @Output() onGoToLink: EventEmitter<any> = new EventEmitter()
  @Output() onShare: EventEmitter<any> = new EventEmitter()

  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent) {
    if (this.writting) {
      this.writeSpeed = 'immediate'
    }
  }

  // Text nodes
  userText: string = ''

  // Writting options
  speeds: any = {
    immediate: 1,
    fast: 10,
    slow: 50,
  }
  writting: boolean = false
  showAnswers: boolean = false
  writterCounter: number = 0

  constructor(public activeStory: ActiveStoryService) {}

  ngOnInit() {
    this.writeSpeed = this.disabled ? 'immediate' : this.writeSpeed
    this.showAnswers = this.writeSpeed === 'immediate'
  }

  // Text node
  continue(textInput: string) {
    this.onContinue.emit({
      property: 'test',
      value: textInput,
      join: this.data.join,
    })
  }

  // Others

  getNativeElement(): HTMLElement {
    return this.node?.nativeElement
  }

  ngAfterViewInit() {
    if (this.writeSpeed !== 'immediate') this.writeText()
  }

  writeText() {
    this.writting = true

    if (this.writterCounter < this.data.text.length) {
      this.textContainer.nativeElement.innerHTML += this.data.text.charAt(
        this.writterCounter
      )
      this.writterCounter++
      setTimeout(() => this.writeText(), this.speeds[this.writeSpeed])
    } else {
      this.writting = false

      setTimeout(() => (this.showAnswers = true), 350)
    }
  }

  markAsSelected(event: any) {
    event.target.classList.add('selected')
  }
}
