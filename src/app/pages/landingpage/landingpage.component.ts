import { AfterRenderPhase, Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { GameComponent } from 'src/app/components/game/game.component'
import { AccentButtonComponent } from 'src/app/components/ui/accent-button/accent-button.component'
import { Data, Router } from '@angular/router'
import { LinkButtonComponent } from 'src/app/components/ui/link-button/link-button.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { DatabaseService } from 'src/app/services/database.service'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    BoardComponent,
    GameComponent,
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
        left: 2503,
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
        left: 2828,
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
    public router: Router,
    public db: DatabaseService
  ) {
    // Check if user comes from external loggin and redirect to dashboard
    const comesFromOAuth = localStorage.getItem('oauth')
    localStorage.removeItem('oauth')
    if (comesFromOAuth) {
      this.router.navigate(['dashboard'])
    }
  }

  ngAfterViewInit() {
    // Initializes the example tree
    // TODO -> Flows are not initializing
    this.activeStory.entireTree.set(this.exampleTree)
    this.board?.centerToNode(this.activeStory.entireTree().nodes[0])
  }
}
