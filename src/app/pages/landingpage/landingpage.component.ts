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
    refs: {
      condition_0: {
        name: 'player_has_egg',
        type: 'condition',
      },
      condition_1: {
        name: 'player_has_cheese',
        type: 'condition',
      },
    },
    nodes: [
      {
        id: 'node_0',
        top: 4851,
        left: 219,
        text: 'You can modify this example in the editor preview below!',
        answers: [
          {
            id: 'answer_0_0',
            join: [
              {
                node: 'node_1',
              },
            ],
            text: 'This answer is connected to another node',
          },
          {
            id: 'answer_0_1',
            text: 'To create another node, just do a right click where you want',
          },
        ],
      },
      {
        id: 'node_1',
        top: 4851,
        left: 539,
        text: 'You can add answers and create different kinds of nodes to connect them and build the flow',
        type: 'content',
        answers: [
          {
            id: 'answer_1_0',
            join: [
              {
                node: 'node_2',
              },
            ],
            text: 'You can connect this answer to another node',
          },
          {
            id: 'answer_1_1',
            join: [
              {
                node: 'node_0',
              },
            ],
            text: 'Or go back to the previous node',
          },
          {
            id: 'answer_1_2',
            join: [
              {
                node: 'node_1',
              },
            ],
            text: 'Maybe to the same node?',
          },
        ],
      },
      {
        id: 'node_2',
        top: 4851,
        left: 856,
        text: "Do you need to block some answers depending on the user choices? No problem. \n\nLet's try to make a fried egg.",
        type: 'content',
        answers: [
          {
            id: 'answer_2_0',
            join: [
              {
                node: 'node_3',
              },
            ],
            text: 'Please give me an egg (this will add egg to the user)',
            events: [
              {
                action: 'alterCondition',
                amount: 1,
                target: 'condition_0',
              },
            ],
          },
          {
            id: 'answer_2_2',
            join: [
              {
                node: 'node_5',
              },
            ],
            text: "Fry the egg 🍳 (this is blocked if user doesn't have egg)",
            requirements: [
              {
                id: 'condition_0',
                type: 'condition',
                amount: 1,
              },
            ],
          },
        ],
      },
      {
        id: 'node_3',
        top: 4854,
        left: 1184,
        text: 'Take this 🥚',
        type: 'content',
        answers: [
          {
            id: 'answer_3_1',
            join: [
              {
                node: 'node_5',
              },
            ],
            text: 'Fry the egg 🍳',
          },
          {
            id: 'answer_3_2',
            join: [
              {
                node: 'node_4',
              },
            ],
            text: 'I prefer to incubate the egg and grow a little chick',
          },
        ],
      },
      {
        id: 'node_4',
        top: 5071,
        left: 1509,
        text: 'Oh, okay. I will let you alone then...',
        type: 'content',
        answers: [
          {
            id: 'answer_4_0',
            join: [
              {
                node: 'node_6',
              },
            ],
            text: '(warm the egg)',
          },
        ],
      },
      {
        id: 'node_5',
        top: 4665,
        left: 1519,
        text: 'Congratulations! You have been nominated to the "Incredible Cheff 2024" awards.\n\nThey want to know which was your secret to make this Fried Egg.',
        type: 'content',
        answers: [
          {
            id: 'answer_5_0',
            text: 'I wanted it to taste like a song of my childhood',
          },
          {
            id: 'answer_5_1',
            text: 'Em.. I just throw a lot of salt',
          },
          {
            id: 'answer_5_2',
            text: 'I cook it for three days before serving',
          },
        ],
      },
      {
        id: 'node_6',
        top: 5068,
        left: 1826,
        text: 'The egg is doing nothing',
        type: 'content',
        answers: [
          {
            id: 'answer_6_0',
            join: [
              {
                node: 'node_6',
              },
              {
                node: 'node_7',
              },
            ],
            text: '(warm a little bit more)',
          },
          {
            id: 'answer_6_1',
            join: [
              {
                node: 'node_5',
              },
            ],
            text: '(give up and fry the egg 🍳)',
          },
        ],
      },
      {
        id: 'node_8',
        top: 4995,
        left: 2237,
        text: "🐣\n\nWow! The egg is now a little chick!\n\nUnfortunately, this is the end of this example, but don't worry, I will take care of the chick.",
        type: 'end',
        links: [
          {
            url: 'textandplay.com/dashboard',
            name: 'Create your own flows',
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
    this.activeStory.entireTree.set(this.exampleTree)
    this.board?.centerToNode(this.activeStory.entireTree().nodes[1])
    setTimeout(() => this.activeStory.activateTreeChangeEffects(), 0)
  }
}
