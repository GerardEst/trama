import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Component({
  selector: 'polo-game-node',
  standalone: true,
  imports: [],
  templateUrl: './game-node.component.html',
  styleUrl: './game-node.component.sass',
})
export class GameNodeComponent {
  @ViewChild('node') node?: ElementRef
  @Input() data!: any
  @Input() disabled: boolean = false
  @Output() onSelectAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onGoToLink: EventEmitter<any> = new EventEmitter()
  @Output() onShare: EventEmitter<any> = new EventEmitter()

  constructor(public activeStory: ActiveStoryService) {}

  getNativeElement(): HTMLElement {
    return this.node?.nativeElement
  }

  markAsSelected(event: any) {
    event.target.classList.add('selected')
  }
}
