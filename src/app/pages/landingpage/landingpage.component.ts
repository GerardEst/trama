import { AfterRenderPhase, Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { FlowComponent } from 'src/app/components/flow/flow.component'
import { PlayService } from '../playground/services/play.service'
import { AccentButtonComponent } from 'src/app/components/ui/accent-button/accent-button.component'
import { Router } from '@angular/router'
import { LinkButtonComponent } from 'src/app/components/ui/link-button/link-button.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    BoardComponent,
    FlowComponent,
    AccentButtonComponent,
    LinkButtonComponent,
  ],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.sass',
})
export class LandingpageComponent {
  @ViewChild('board') board?: BoardComponent

  exampleTree: any = {
    refs: [],
    nodes: [
      {
        id: 'node_0',
        top: 4996,
        left: 503,
        answers: [
          {
            id: 'answer_0_0',
            text: 'This will point to the next node',
            join: [{ node: 'node_1' }],
          },
        ],
        text: 'Modify this example to fit your needs',
      },
      {
        id: 'node_1',
        type: 'content',
        top: 4994,
        left: 828,
        text: 'You could, for example, ask a question here',
        answers: [
          { id: 'answer_1_0', text: 'And multiple answers' },
          { id: 'answer_1_1', text: 'Like this one' },
          { id: 'answer_1_2', text: 'Or this other' },
        ],
      },
    ],
  }

  constructor(
    private activeStory: ActiveStoryService,
    public router: Router
  ) {}

  ngAfterViewInit() {
    // Initializes the example tree
    // TODO -> Flows are not initializing
    this.activeStory.entireTree.set(this.exampleTree)
    this.board?.centerToNode(this.activeStory.entireTree().nodes[1])
  }
}
