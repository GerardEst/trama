import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { trigger, style, transition, animate } from '@angular/animations'

@Component({
  selector: 'polo-game-node',
  standalone: true,
  imports: [],
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
  @Output() onGoToLink: EventEmitter<any> = new EventEmitter()
  @Output() onShare: EventEmitter<any> = new EventEmitter()

  // Writting options
  speeds: any = {
    fast: 10,
    slow: 50,
  }
  showAnswers: boolean = false
  writterCounter: number = 0

  constructor(public activeStory: ActiveStoryService) {}

  ngOnInit() {
    this.writeSpeed = this.disabled ? 'immediate' : this.writeSpeed
    this.showAnswers = this.writeSpeed === 'immediate'
  }

  getNativeElement(): HTMLElement {
    return this.node?.nativeElement
  }

  ngAfterViewInit() {
    if (this.writeSpeed !== 'immediate') this.writeText()
  }

  writeText() {
    if (this.writterCounter < this.data.text.length) {
      this.textContainer.nativeElement.innerHTML += this.data.text.charAt(
        this.writterCounter
      )
      this.writterCounter++
      setTimeout(() => this.writeText(), this.speeds[this.writeSpeed])
    } else {
      setTimeout(() => (this.showAnswers = true), 350)
    }
  }

  markAsSelected(event: any) {
    event.target.classList.add('selected')
  }
}
