import { Component } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { FlowComponent } from 'src/app/components/flow/flow.component'
import { PlayService } from '../playground/services/play.service'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [BoardComponent, FlowComponent],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.sass',
})
export class LandingpageComponent {
  exampleTree: any = {
    name: 'Starter',
    tree: {
      refs: [],
      nodes: [
        {
          id: 'node_0',
          top: 4996,
          left: 503,
          answers: [
            { id: 'answer_0_0', text: "Let's go!", join: [{ node: 'node_1' }] },
          ],
          text: 'To find out your recommended coffe machine, we need you to answer some questions',
        },
        {
          id: 'node_1',
          type: 'content',
          top: 4994,
          left: 828,
          text: 'Which type of coffe do you prefer?',
          answers: [
            { id: 'answer_1_0', text: 'Molted', join: [{ node: 'node_2' }] },
            { id: 'answer_1_1', text: 'Grane', join: [{ node: 'node_3' }] },
            { id: 'answer_1_2', text: 'Capsule', join: [{ node: 'node_4' }] },
          ],
        },
        {
          id: 'node_2',
          type: 'content',
          top: 4882,
          left: 1177,
          text: 'This products can fit your needs',
          answers: [
            { id: 'answer_2_0', text: 'Coffe machine #1' },
            { id: 'answer_2_1', text: 'Coffe machine #2' },
          ],
        },
        {
          id: 'node_3',
          type: 'content',
          top: 5185,
          left: 1176,
          text: 'This product can fit your needs',
          answers: [{ id: 'answer_3_0', text: 'Coffe machine #3' }],
        },
        {
          id: 'node_4',
          type: 'content',
          top: 5442,
          left: 1175,
          text: 'This product can fit your needs',
          answers: [{ id: 'answer_4_0', text: 'Coffe machine #4' }],
        },
      ],
    },
  }

  constructor(private playService: PlayService) {}

  ngOnInit() {
    this.playService.story.set(this.exampleTree)
  }

  // todo -> Pot ser important perque no quedi la historia aquesta guardada si s'entra desde la landing page
  // ngOnDestroy() {
  //   this.playService.story.reset()
  // }
}
