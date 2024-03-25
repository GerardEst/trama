import { Component } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { FlowComponent } from 'src/app/components/flow/flow.component'
import { PlayService } from '../playground/services/play.service'
import { AccentButtonComponent } from 'src/app/components/accent-button/accent-button.component'
import { Router } from '@angular/router'
import { LinkButtonComponent } from 'src/app/components/link-button/link-button.component'

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
  exampleTree: any = {
    name: 'Example',
    tree: {
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
    },
  }

  constructor(
    private playService: PlayService,
    public router: Router
  ) {}

  ngOnInit() {
    this.playService.story.set(this.exampleTree)
    localStorage.setItem('polo-tree', JSON.stringify(this.exampleTree))
  }
}
