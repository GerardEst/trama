import { AfterRenderPhase, Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { GameComponent } from 'src/app/components/game/game.component'
import { AccentButtonComponent } from 'src/app/components/ui/accent-button/accent-button.component'
import { Data, Router } from '@angular/router'
import { LinkButtonComponent } from 'src/app/components/ui/link-button/link-button.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { DatabaseService } from 'src/app/services/database.service'
import * as Cronitor from '@cronitorio/cronitor-rum'

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
            text: 'This answer is connected to another node',
            join: [{ node: 'node_1' }],
          },
          {
            id: 'answer_0_1',
            text: 'To create another node, just do a right click where you want',
          },
        ],
        text: 'You can play with this example!',
      },
      {
        id: 'node_1',
        type: 'content',
        top: 4994,
        left: 2828,
        text: 'You can add answers and create different kinds of nodes to connect them and build the flow',
        answers: [
          {
            id: 'answer_1_0',
            text: 'You can connect this answer to another node',
          },
          { id: 'answer_1_1', text: 'Or to the same node' },
          {
            id: 'answer_1_2',
            text: 'Or join two nodes! It will be the fate who decides',
          },
        ],
      },
    ],
  }

  constructor(
    private activeStory: ActiveStoryService,
    public router: Router,
    public db: DatabaseService
  ) {}

  ngAfterViewInit() {
    Cronitor.track('LandingpageView')
    // console.log('________LANDING PAGE__________')
    // // Check if user comes from external loggin and redirect to dashboard
    // const comesFromOAuth = localStorage.getItem('oauth')
    // console.log('user:', this.db.user)
    // if (comesFromOAuth && this.db.user) {
    //   console.log('Navigate to dashboard!!!')
    //   this.router.navigate(['/dashboard'])
    // }
    // Initializes the example tree
    // TODO -> Flows are not initializing
    this.activeStory.entireTree.set(this.exampleTree)
    this.board?.centerToNode(this.activeStory.entireTree().nodes[0])
  }
}
