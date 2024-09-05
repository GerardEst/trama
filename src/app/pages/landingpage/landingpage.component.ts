import { Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { Router } from '@angular/router'
import { LinkButtonComponent } from 'src/app/components/ui/link-button/link-button.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { DatabaseService } from 'src/app/services/database.service'
import * as Cronitor from '@cronitorio/cronitor-rum'

import { LandingCardComponent } from './components/landing-card/landing-card.component'
import { LandingButtonComponent } from './components/button/landing-button.component'
import { LandingMobileComponent } from './components/landing-mobile/landing-mobile.component'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    BoardComponent,
    LinkButtonComponent,
    LandingMobileComponent,
    LandingButtonComponent,
    LandingCardComponent,
  ],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.sass',
})
export class LandingpageComponent {
  @ViewChild('board') board?: BoardComponent

  exampleTree: any = {
    refs: {
      stat_0: {
        name: 'victory_point',
        type: 'stat',
      },
    },
    nodes: [
      {
        id: 'node_0',
        top: 4502,
        join: [],
        left: 743,
        text: 'Create with the easiest tools, as easy as joining nodes and as complex as you want it to be.',
        answers: [
          {
            id: 'answer_0_1',
            join: [
              {
                node: 'node_1',
                toAnswer: false,
              },
            ],
            text: 'Click me! I will take you to the next node\n\n(As you can see in the board on your left)',
          },
        ],
      },
      {
        id: 'node_1',
        top: 4500,
        left: 1083,
        text: 'Great, we went to the next node.\n\nYou can also easily send users to one place or another just joining answers',
        type: 'content',
        answers: [
          {
            id: 'answer_1_0',
            join: [
              {
                node: 'node_2',
                toAnswer: false,
              },
            ],
            text: 'Go to the node A',
          },
          {
            id: 'answer_1_1',
            join: [
              {
                node: 'node_3',
                toAnswer: false,
              },
            ],
            text: 'Go to the node B',
          },
        ],
      },
      {
        id: 'node_2',
        top: 4558,
        join: [
          {
            node: 'node_4',
            toAnswer: false,
          },
        ],
        left: 1424,
        text: 'This is the node A',
        type: 'content',
      },
      {
        id: 'node_3',
        top: 4758,
        join: [
          {
            node: 'node_4',
            toAnswer: false,
          },
        ],
        left: 1423,
        text: 'This is the node B',
        type: 'content',
      },
      {
        id: 'node_4',
        top: 4631,
        join: [
          {
            node: 'node_5',
            toAnswer: false,
          },
        ],
        left: 1765,
        text: "We can add some more complexity to the paths, using stats and conditions. Let's just count victory points if you answer correctly some questions:",
        type: 'content',
        answers: [],
      },
      {
        id: 'node_5',
        top: 4631,
        left: 2110,
        text: 'How much is 2+2?',
        type: 'content',
        answers: [
          {
            id: 'answer_5_0',
            join: [
              {
                node: 'node_6',
                toAnswer: false,
              },
            ],
            text: '3',
            events: [],
          },
          {
            id: 'answer_5_1',
            join: [
              {
                node: 'node_6',
                toAnswer: false,
              },
            ],
            text: '4',
            events: [
              {
                action: 'alterStat',
                amount: 1,
                target: 'stat_0',
              },
            ],
          },
          {
            id: 'answer_5_2',
            join: [
              {
                node: 'node_6',
                toAnswer: false,
              },
            ],
            text: '5',
          },
        ],
      },
      {
        id: 'node_6',
        top: 4630,
        left: 2476,
        text: 'What do you have in your head?',
        type: 'content',
        answers: [
          {
            id: 'answer_6_0',
            join: [
              {
                node: 'node_7',
                toAnswer: false,
              },
            ],
            text: 'A nose',
            events: [
              {
                action: 'alterStat',
                amount: 1,
                target: 'stat_0',
              },
            ],
          },
          {
            id: 'answer_6_1',
            join: [
              {
                node: 'node_7',
                toAnswer: false,
              },
            ],
            text: 'A finger',
          },
          {
            id: 'answer_6_2',
            join: [
              {
                node: 'node_7',
                toAnswer: false,
              },
            ],
            text: 'A whale',
          },
        ],
      },
      {
        id: 'node_7',
        top: 4627,
        join: [
          {
            node: 'node_8',
            toAnswer: false,
          },
        ],
        left: 2839,
        text: 'Ok, you have got #stat_0 victory points!\n\nTwo things happened here! The most obbious is that we counted the points adding events to the right answers.\n\nBut we also told you your points inside this same text: #stat_0. (This is done by doing hashtag plus the stat you want to show. Easy as always)\n\nNow we will use a special kind of node which we call "Distributor" to congratulate you if you did well, and to cheer you up if you have 1 or 0 points.',
        type: 'content',
        answers: [
          {
            id: 'answer_7_1',
            join: [
              {
                node: 'node_8',
                toAnswer: false,
              },
            ],
            text: 'Let\'s see that "Distributor" node in action',
          },
        ],
      },
      {
        id: 'node_8',
        top: 4627,
        left: 3175,
        type: 'distributor',
        conditions: [
          {
            id: 'condition_8_0',
            ref: 'stat_0',
            join: [
              {
                node: 'node_9',
                toAnswer: false,
              },
            ],
            value: '2',
            comparator: 'lessthan',
          },
        ],
        fallbackCondition: {
          id: 'condition_8_fallback',
          join: [
            {
              node: 'node_10',
              toAnswer: false,
            },
          ],
        },
      },
      {
        id: 'node_9',
        top: 4539,
        join: [],
        left: 3508,
        text: "So since you made #stat_0 points, we should say don't worry! Next time will be better 🤗",
        type: 'content',
        answers: [
          {
            id: 'answer_9_0',
            join: [
              {
                node: 'node_12',
                toAnswer: false,
              },
            ],
            text: 'Thanks...',
          },
        ],
      },
      {
        id: 'node_10',
        top: 4801,
        join: [],
        left: 3509,
        text: 'So since you made #stat_0 points, we should say very good! Awasome job 🤗',
        type: 'content',
        answers: [
          {
            id: 'answer_10_0',
            join: [
              {
                node: 'node_12',
                toAnswer: false,
              },
            ],
            text: 'Thank you!',
          },
        ],
      },
      {
        id: 'node_12',
        top: 4691,
        left: 3881,
        text: 'You are welcome!\n\nThere are more things that can help you creating amazing flows, for example...\n- Block or allow an answer dependig on user stats, \n- Use conditions instead of stats for things that are true or false,\n- Join to the answers of a node directly instead of joining to the text of the node (useful if you are making some kind of loop and don\'t want to show the text every time)\n- Use the "End node" type to add external links and share options\n\nAnd more! And lots of things will come in the future.\n\nFeel free to edit this example in the board on your left to see how it feels to build in textandplay, or jump in the dashboard to create something now.\n\nThank you for being here! 😊',
        type: 'end',
        links: [
          {
            url: 'textandplay.com/dashboard',
            name: 'Start creating something!',
          },
          {
            url: 'textandplay.com/dashboard',
            name: 'See all the features',
          },
          {
            url: 'textandplay.com/dashboard',
            name: 'Check the roadmap',
          },
        ],
      },
    ],
  }

  checkedLoggedUser: boolean = false
  loggedUser: boolean = false
  showEditor: boolean = false

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

    this.checkLoggedUser()
    // Initializes the example tree
    this.activeStory.entireTree.set(this.exampleTree)
    this.board?.centerToNode(this.activeStory.entireTree().nodes[1])
    setTimeout(() => this.activeStory.activateTreeChangeEffects(), 0)
  }

  openExampleSource() {
    this.showEditor = true
  }
  closeExampleSource() {
    this.showEditor = false
  }

  async checkLoggedUser() {
    const loggedUser = await this.db.supabase.auth.getUser()

    this.loggedUser = !!loggedUser?.data?.user?.id
    this.checkedLoggedUser = true
  }

  usePro() {
    this.loggedUser
      ? this.router.navigate(['dashboard'])
      : this.router.navigate(['login'], {
          queryParams: { mode: 'register', plan: 'pro' },
        })
  }
}
