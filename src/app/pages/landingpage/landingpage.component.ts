import { AfterRenderPhase, Component, ViewChild } from '@angular/core'
import { BoardComponent } from 'src/app/components/board/board.component'
import { GameComponent } from 'src/app/components/game/game.component'
import { AccentButtonComponent } from 'src/app/components/ui/accent-button/accent-button.component'
import { Data, Router } from '@angular/router'
import { LinkButtonComponent } from 'src/app/components/ui/link-button/link-button.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { DatabaseService } from 'src/app/services/database.service'
import * as Cronitor from '@cronitorio/cronitor-rum'
import { BasicButtonComponent } from '../../components/ui/basic-button/basic-button.component'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    BoardComponent,
    GameComponent,
    AccentButtonComponent,
    LinkButtonComponent,
    BasicButtonComponent,
  ],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.sass',
})
export class LandingpageComponent {
  @ViewChild('board') board?: BoardComponent

  exampleTree: any = {
    refs: {
      stat_4: { name: 'apple', type: 'stat', category: 'fruit' },
      stat_5: { name: 'banana', type: 'stat', category: 'fruit' },
      stat_6: { name: 'peach', type: 'stat', category: 'fruit' },
      stat_7: { name: 'oldManSimpaty', type: 'stat' },
      condition_0: { name: 'griffindor', type: 'condition' },
      condition_1: { name: 'ravenclaw', type: 'condition' },
      condition_2: { name: 'hufflepuff', type: 'condition' },
      condition_3: { name: 'slytherin', type: 'condition' },
    },
    nodes: [
      {
        id: 'node_0',
        top: 4893,
        left: 465,
        text: 'Hi, I\'m an interactive story created as an example of the things you can build with textandplay.com\n\nDo you remember that choose-your-own-adventure books? They were fun. And what about tests like "Which Harry Potter character are you"?. I\'ve done all of them.',
        image: {
          path: '9c60d77b-fa48-4a27-80fc-e732adea139e/8f5813e6-9321-49c7-bf91-59efd265e658/node_0',
        },
        answers: [
          {
            id: 'answer_0_0',
            join: [{ node: 'node_1', toAnswer: false }],
            text: 'Me too, and my hogwarts house is better',
          },
          {
            id: 'answer_0_1',
            join: [{ node: 'node_2', toAnswer: false }],
            text: 'I know what you are talking about',
          },
          {
            id: 'answer_0_2',
            join: [{ node: 'node_3', toAnswer: false }],
            text: "I really don't like this kind of things",
          },
        ],
      },
      {
        id: 'node_1',
        top: 4761,
        left: 829,
        text: "That's impossible because I'm Hufflepuff. Which  one are you?",
        type: 'content',
        answers: [
          {
            id: 'answer_1_0',
            join: [{ node: 'node_6', toAnswer: false }],
            text: 'Griffindor',
            events: [
              { action: 'alterCondition', amount: 1, target: 'condition_0' },
            ],
          },
          {
            id: 'answer_1_1',
            join: [{ node: 'node_7', toAnswer: false }],
            text: 'Ravenclaw',
            events: [
              { action: 'alterCondition', amount: 1, target: 'condition_1' },
            ],
          },
          {
            id: 'answer_1_2',
            join: [{ node: 'node_11', toAnswer: false }],
            text: 'Hufflepuff',
            events: [
              { action: 'alterCondition', amount: 1, target: 'condition_2' },
            ],
          },
          {
            id: 'answer_1_3',
            join: [{ node: 'node_8', toAnswer: false }],
            text: 'Slytherin',
            events: [
              { action: 'alterCondition', amount: 1, target: 'condition_3' },
            ],
          },
        ],
      },
      {
        id: 'node_2',
        top: 5177,
        left: 828,
        text: 'Perfect. You can create this kind of interactions veeery easily, just connecting some nodes, and make it as complex as you want.\n\nYou can use it for fun, just to send some tests to your friends, or professionaly to engage users and point them to your brand or product. ',
        type: 'content',
        answers: [
          {
            id: 'answer_2_0',
            join: [{ node: 'node_4', toAnswer: false }],
            text: "I'm interested, but I would like to know more",
          },
          {
            id: 'answer_2_1',
            join: [{ node: 'node_5', toAnswer: false }],
            text: 'Can I use it to make my dinner?',
          },
        ],
      },
      {
        id: 'node_3',
        top: 5486,
        left: 830,
        text: "That's fine, you may not like, but there are a lot of people who likes it, and you can reach them creating this kind of interactions.",
        type: 'content',
        answers: [
          {
            id: 'answer_3_0',
            join: [{ node: 'node_4', toAnswer: false }],
            text: 'May be interesting... tell me more',
          },
          {
            id: 'answer_3_1',
            text: 'I think this is not a good way to reach people',
          },
        ],
      },
      {
        id: 'node_4',
        top: 5469,
        left: 1346,
        text: 'Sure! What do you wanna know?',
        type: 'content',
        answers: [
          {
            id: 'answer_4_0',
            join: [{ node: 'node_12', toAnswer: false }],
            text: 'Features',
          },
          {
            id: 'answer_4_1',
            join: [{ node: 'node_13', toAnswer: false }],
            text: 'Pricing',
          },
          {
            id: 'answer_4_2',
            join: [{ node: 'node_15', toAnswer: false }],
            text: 'Roadmap',
          },
          {
            id: 'answer_4_3',
            join: [{ node: 'node_16', toAnswer: false }],
            text: 'About me',
          },
          {
            id: 'answer_4_4',
            join: [{ node: 'node_17', toAnswer: false }],
            text: 'Use cases',
          },
          {
            id: 'answer_4_5',
            join: [{ node: 'node_18', toAnswer: false }],
            text: "That's all!",
          },
        ],
      },
      {
        id: 'node_5',
        top: 5166,
        left: 1207,
        text: 'Noo..',
        type: 'content',
        answers: [
          {
            id: 'answer_5_0',
            join: [{ node: 'node_19', toAnswer: false }],
            text: 'Ooh...',
          },
        ],
      },
      {
        id: 'node_6',
        top: 3858,
        left: 1206,
        text: 'Oh you brave and beautiful human, take all your trophies and go kill some monsters, I will wait here with my hedgehog.',
        type: 'content',
        answers: [
          {
            id: 'answer_6_0',
            join: [{ node: 'node_25', toAnswer: false }],
            text: "Actually I'm heading to an adventure to kill a monster.",
          },
        ],
      },
      {
        id: 'node_7',
        top: 4487,
        left: 1198,
        text: 'Oh do you like puzzles and riddles?\n\nWhat about this one: Full of words and plenty of choices, I take you through uncharted paths, but It\'s not me who leaves the traces, it is you with your own "taps"',
        type: 'content',
        answers: [
          {
            id: 'answer_7_0',
            join: [{ node: 'node_23', toAnswer: false }],
            text: 'You are a bear!',
          },
          {
            id: 'answer_7_1',
            join: [{ node: 'node_24', toAnswer: false }],
            text: 'You are textandplay!',
          },
          {
            id: 'answer_7_2',
            join: [{ node: 'node_23', toAnswer: false }],
            text: 'You are a pinnaple!',
          },
        ],
      },
      {
        id: 'node_8',
        top: 4829,
        left: 1197,
        text: 'Am I in danger?',
        type: 'content',
        answers: [
          {
            id: 'answer_8_0',
            join: [{ node: 'node_9', toAnswer: false }],
            text: 'Yes',
          },
          {
            id: 'answer_8_1',
            join: [{ node: 'node_10', toAnswer: false }],
            text: 'No',
          },
        ],
      },
      {
        id: 'node_9',
        top: 4714,
        left: 1526,
        text: 'Fuck',
        type: 'content',
        answers: [
          {
            id: 'answer_9_0',
            join: [{ node: 'node_21', toAnswer: false }],
            text: 'AVADA KEDAVRA!',
          },
        ],
      },
      {
        id: 'node_10',
        top: 4960,
        join: [],
        left: 1524,
        text: '🥹\n\nYou are a nice powerful wizard, ready to make great wonderful things.',
        type: 'content',
        answers: [
          {
            id: 'answer_10_0',
            join: [{ node: 'node_25', toAnswer: false }],
            text: "Yes I am! Let's go to an adventure!",
          },
        ],
      },
      {
        id: 'node_11',
        top: 4130,
        left: 1208,
        text: "Yeees we are the best and we have the warmest homes.\n\nBecause we want to stay at home, aren't we?",
        type: 'content',
        answers: [
          {
            id: 'answer_11_0',
            join: [{ node: 'node_25', toAnswer: false }],
            text: 'Actually... I like adventures as long as there are animals!',
          },
        ],
      },
      {
        id: 'node_12',
        top: 5469,
        join: [{ node: 'node_14', toAnswer: false }],
        left: 1701,
        text: 'You can check the features below in this website, but here you have some interesting things you can use:\n- Connect nodes to build a branched flow\n- Modify the flow depending on previous choices\n- Add user info in the texts like "Hello #username" or "Inventory [group of stats]"\n- Use distributor nodes to take user to diferent nodes depending on his status\n- Use end nodes to take your users to external links\n- Point an answer to some random nodes\n- Track user choices and see statistics (with pro version)\n\nThere are more, and more will come in the future, but those are the essentials.',
        type: 'content',
        answers: [],
      },
      {
        id: 'node_13',
        top: 5646,
        join: [{ node: 'node_14', toAnswer: false }],
        left: 1699,
        text: 'Currently, there is a generous free version and a paid version to access the track and statistics feature, but this is a new project and it may change in the future.',
        type: 'content',
      },
      {
        id: 'node_14',
        top: 5470,
        join: [{ node: 'node_4', toAnswer: true }],
        left: 2038,
        text: 'Is there something else you would like to know?',
        type: 'content',
      },
      {
        id: 'node_15',
        top: 5825,
        join: [{ node: 'node_14', toAnswer: false }],
        left: 1698,
        text: "This is a young project, and I would like to add many things, but I don't know which ones are important for you. \nSo I will probably make something to choose the future features with your opinions.",
        type: 'content',
      },
      {
        id: 'node_16',
        top: 6002,
        join: [{ node: 'node_14', toAnswer: false }],
        left: 1698,
        text: "I'm Gerard, I started to build this for myself, because I wanted to create a text adventure builder.\nLater, some teachers started to use it to make exams and track student choices to see pain points etc.\nNow I'm trying to make some money of it, or at least to have some fun.",
        type: 'content',
      },
      {
        id: 'node_17',
        top: 6180,
        join: [{ node: 'node_14', toAnswer: false }],
        left: 1698,
        text: "I think this can be useful for a lot of things, but at the end of the day this is just a tool. \n\nI would like to build a tool where creativity is your only limitation, where you can build a text adventure, an exam, a fun test for your friends, a serious psicological test, a helper to choose what to see on the tv, I don't know.\n\nThe tool is yours, use it however you like.",
        type: 'content',
      },
      {
        id: 'node_18',
        top: 5822,
        left: 3683,
        text: 'Nice! Thank you very much for your interest. If you want to have a little adventure, I recommend you to refresh and choose the "Me too, and my house is better" option 😉\n\nIf you have  any questions, feel free to reach me at hello@textandplay.com\n\nI hope to see you again.',
        type: 'end',
      },
      {
        id: 'node_19',
        top: 5206,
        left: 1518,
        text: "But you can do a lot of things! \nI promise! \n\nDon't leave me",
        type: 'content',
        answers: [
          {
            id: 'answer_19_0',
            join: [{ node: 'node_20', toAnswer: false }],
            text: 'Show me something cool',
          },
        ],
      },
      {
        id: 'node_20',
        top: 5115,
        left: 1862,
        text: 'I can save stats of you, for example if you take a fruit here, I can remember your choice and use it in the future!',
        type: 'content',
        answers: [
          {
            id: 'answer_20_0',
            join: [{ node: 'node_30', toAnswer: false }],
            text: '(take an apple 🍎)',
            events: [{ action: 'alterStat', amount: 1, target: 'stat_4' }],
          },
          {
            id: 'answer_20_1',
            join: [{ node: 'node_30', toAnswer: false }],
            text: '(take a banana 🍌)',
            events: [{ action: 'alterStat', amount: 1, target: 'stat_5' }],
          },
          {
            id: 'answer_20_2',
            join: [{ node: 'node_30', toAnswer: false }],
            text: '(take a peach 🍑)',
            events: [{ action: 'alterStat', amount: 1, target: 'stat_6' }],
          },
        ],
      },
      {
        id: 'node_21',
        top: 4565,
        left: 2970,
        text: '(Congratulations, you killed the interviewer, making honor to your house and leaving this website without live)',
        type: 'end',
        links: [
          {
            url: 'textandplay.com',
            name: 'Refresh the page to revive the interviewer',
          },
        ],
      },
      {
        id: 'node_23',
        top: 4353,
        join: [{ node: 'node_35', toAnswer: false }],
        left: 1526,
        text: "Not at all. I am textandplay. But don't worry even ravenclaws have hufflepuff moments.",
        type: 'content',
      },
      {
        id: 'node_24',
        top: 4534,
        join: [{ node: 'node_35', toAnswer: false }],
        left: 1523,
        text: 'Yees you are so ravenclaw!',
        type: 'content',
      },
      {
        id: 'node_25',
        top: 3858,
        join: [{ node: 'node_26', toAnswer: false }],
        left: 1949,
        text: 'An adventure has started!!',
        type: 'content',
        image: {
          path: '9c60d77b-fa48-4a27-80fc-e732adea139e/8f5813e6-9321-49c7-bf91-59efd265e658/node_25',
        },
        answers: [],
      },
      {
        id: 'node_26',
        top: 3700,
        left: 2325,
        text: "You find a river. It's brave and seems deep, but there are those rocks resembling a path...",
        type: 'content',
        answers: [
          {
            id: 'answer_26_0',
            join: [
              { node: 'node_27', toAnswer: false },
              { node: 'node_28', toAnswer: false },
            ],
            text: "I'm brave! I will swim!! \n(because you are from Griffindor) \n(50% chances to survive)",
            requirements: [{ id: 'condition_0', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_26_1',
            join: [{ node: 'node_29', toAnswer: false }],
            text: 'Use the rocks like a coward',
            requirements: [{ id: 'condition_0', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_26_2',
            join: [
              { node: 'node_27', toAnswer: false },
              { node: 'node_28', toAnswer: false },
            ],
            text: 'Use the rocks \n(50% chances to survive)',
            requirements: [{ id: 'condition_0', type: 'condition', amount: 0 }],
          },
          {
            id: 'answer_26_3',
            join: [{ node: 'node_40', toAnswer: false }],
            text: "I'll ask this turtle for help\n(because you are from Hufflepuff)",
            requirements: [{ id: 'condition_2', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_26_4',
            join: [{ node: 'node_38', toAnswer: false }],
            text: "I'm a wizard, I have lots of options to cross\n(because you are from Ravenclaw)",
            requirements: [{ id: 'condition_1', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_26_5',
            join: [{ node: 'node_39', toAnswer: false }],
            text: "I'm powerful! I WINGARDIUMLEVIOSA myself and fly over the river!\n(because you are from Slytherin)",
            requirements: [{ id: 'condition_3', type: 'condition', amount: 1 }],
          },
        ],
      },
      {
        id: 'node_27',
        top: 3467,
        join: [{ node: 'node_43', toAnswer: false }],
        left: 2718,
        text: 'You did it! Wow! There was a moment where you disappeared for one minute under the water!\n\nBut here you are, soaked and trembling, good to go!',
        type: 'content',
      },
      {
        id: 'node_28',
        top: 3180,
        left: 2524,
        text: 'Well... you died',
        type: 'content',
        answers: [
          {
            id: 'answer_28_0',
            join: [{ node: 'node_25', toAnswer: false }],
            text: 'Let me try again',
          },
        ],
      },
      {
        id: 'node_29',
        top: 3643,
        join: [{ node: 'node_43', toAnswer: false }],
        left: 2720,
        text: 'You cross the river thanks to your legendary griffindor balance.',
        type: 'content',
      },
      {
        id: 'node_30',
        top: 5115,
        left: 2209,
        text: 'Ok, now you have \n\n[fruit]',
        type: 'content',
        answers: [
          {
            id: 'answer_30_0',
            join: [{ node: 'node_31', toAnswer: false }],
            text: 'Ooh you remember',
          },
          {
            id: 'answer_30_1',
            join: [{ node: 'node_32', toAnswer: false }],
            text: 'This is not very spectacular',
          },
        ],
      },
      {
        id: 'node_31',
        top: 5112,
        join: [{ node: 'node_33', toAnswer: false }],
        left: 2530,
        text: 'I told you, and I can count. Take another fruit.',
        type: 'content',
      },
      {
        id: 'node_32',
        top: 5297,
        join: [{ node: 'node_33', toAnswer: false }],
        left: 2563,
        text: 'But look, I can count all the things you have, take another fruit',
        type: 'content',
      },
      {
        id: 'node_33',
        top: 5097,
        left: 2941,
        text: 'I know you have #apple apples, #banana bananas and #peach peaches.',
        type: 'content',
        answers: [
          {
            id: 'answer_33_0',
            join: [{ node: 'node_33', toAnswer: false }],
            text: '(take an apple 🍎)',
            events: [{ action: 'alterStat', amount: 1, target: 'stat_4' }],
          },
          {
            id: 'answer_33_1',
            join: [{ node: 'node_33', toAnswer: false }],
            text: '(take a banana 🍌)',
            events: [{ action: 'alterStat', amount: 1, target: 'stat_5' }],
          },
          {
            id: 'answer_33_2',
            join: [{ node: 'node_33', toAnswer: false }],
            text: '(take a peach 🍑)',
            events: [{ action: 'alterStat', amount: 1, target: 'stat_6' }],
          },
          {
            id: 'answer_33_3',
            join: [{ node: 'node_34', toAnswer: false }],
            text: 'Stop taking fruits, I have had enough',
          },
        ],
      },
      {
        id: 'node_34',
        top: 5388,
        left: 3289,
        text: 'There are a lot more things you can do, but I will let you discover it by yourself.\n\nIf you want, I can provide you more generic information now.',
        type: 'content',
        answers: [
          {
            id: 'answer_34_0',
            join: [{ node: 'node_4', toAnswer: false }],
            text: 'Yes please',
          },
          {
            id: 'answer_34_1',
            join: [{ node: 'node_18', toAnswer: false }],
            text: "No, that's all",
          },
        ],
      },
      {
        id: 'node_35',
        top: 4402,
        left: 1939,
        text: 'Hmm... Are you too smart for a dangerous adventure?',
        type: 'content',
        answers: [
          {
            id: 'answer_35_0',
            join: [{ node: 'node_36', toAnswer: false }],
            text: 'Yes, I would like to go to my chamber and study all night',
          },
          {
            id: 'answer_35_1',
            join: [{ node: 'node_25', toAnswer: false }],
            text: "I'm very smart so I will win this adventure!",
          },
        ],
      },
      {
        id: 'node_36',
        top: 4401,
        left: 2291,
        text: 'Are you joking?',
        type: 'content',
        answers: [
          {
            id: 'answer_36_0',
            join: [{ node: 'node_25', toAnswer: false }],
            text: "Yees! Let's take an adventure!",
          },
          {
            id: 'answer_36_1',
            join: [{ node: 'node_37', toAnswer: false }],
            text: 'Am I what?',
          },
        ],
      },
      {
        id: 'node_37',
        top: 4566,
        left: 2657,
        text: 'Oh. Fine. See you tomorrow then.\n\n(Your adventure ends before even starting)',
        type: 'end',
        links: [
          {
            url: 'textandplay.com',
            name: 'Refresh the page to be more adventurous',
          },
        ],
      },
      {
        id: 'node_38',
        top: 4007,
        join: [{ node: 'node_43', toAnswer: false }],
        left: 2720,
        text: 'You do some wand waggins and sudenly you are at the other side of the river, clean and excelent to go.',
        type: 'content',
      },
      {
        id: 'node_39',
        top: 4187,
        join: [{ node: 'node_43', toAnswer: false }],
        left: 2720,
        text: 'You shoot out to the other side of the river, where the ground is waiting for you with all his gravity. \nAfter all, you are fine and ready to go.',
        type: 'content',
      },
      {
        id: 'node_40',
        top: 3825,
        join: [{ node: 'node_43', toAnswer: false }],
        left: 2722,
        text: "You speak with the turtle, and she is rude because she doesn't like people to sit on his back, but she accepts to take you if you give her a massage on her head while swimming.\n\nYou accept and she takes you to the other side. The river is crossed!",
        type: 'content',
        answers: [],
      },
      {
        id: 'node_42',
        top: 3887,
        left: 6481,
        text: '(adventure on progress, come soon for more)\n\nYou can create and share adventures like this, too! Just login and build something great.',
        type: 'end',
        links: [{ url: 'textandplay.com/login', name: 'Register' }],
      },
      {
        id: 'node_43',
        top: 3717,
        left: 3143,
        text: 'After some time in a forest, you find a little hut surrounded by flowers and magical equipment.',
        type: 'content',
        answers: [
          {
            id: 'answer_43_0',
            join: [{ node: 'node_46', toAnswer: false }],
            text: 'I knock knock the door',
          },
          {
            id: 'answer_43_1',
            join: [{ node: 'node_44', toAnswer: false }],
            text: 'I keep walking',
            requirements: [{ id: 'condition_2', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_43_2',
            join: [{ node: 'node_45', toAnswer: false }],
            text: 'I hide behing a brush amd wait',
          },
        ],
      },
      {
        id: 'node_44',
        top: 3889,
        left: 4609,
        text: 'You are walking, whistling that entry song of every Harry Potter movie with passion, when you see the trace of a horse, and it should be very big based on the footsteps.',
        type: 'content',
        answers: [
          {
            id: 'answer_44_0',
            join: [{ node: 'node_42', toAnswer: false }],
            text: 'I have to follow the footsteps!',
          },
          {
            id: 'answer_44_1',
            join: [{ node: 'node_42', toAnswer: false }],
            text: 'Wait, this is not from a horse, this is a Unicorn\n(because you are from Hufflepuff)',
            requirements: [{ id: 'condition_2', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_44_2',
            join: [{ node: 'node_42', toAnswer: false }],
            text: "I don't like horses, they are dangerous animals",
          },
        ],
      },
      {
        id: 'node_45',
        top: 3953,
        left: 3482,
        text: 'You wait for some hours, but there is no activity in the house nor the surroundings of it. \n\nThe magical tools have been gardening the flowers, bees come and go with honey, axes are cutting trunks and baskets are harvesting tomatoes.',
        type: 'content',
        answers: [
          {
            id: 'answer_45_0',
            join: [{ node: 'node_47', toAnswer: false }],
            text: 'The magic here is so powerful...\n(because you are from Slytherin)',
            requirements: [{ id: 'condition_3', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_45_1',
            join: [{ node: 'node_48', toAnswer: false }],
            text: 'There is some strange pattern here...\n(because you are from Ravenclaw)',
            requirements: [{ id: 'condition_1', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_45_2',
            join: [{ node: 'node_49', toAnswer: false }],
            text: "The bees shouldn't be this busy at this time of the year...\n(because you are from Hufflepuff)",
            requirements: [{ id: 'condition_2', type: 'condition', amount: 1 }],
          },
          {
            id: 'answer_45_3',
            join: [{ node: 'node_46', toAnswer: false }],
            text: 'Everything seems alright. No suspitious at all. I will knock at the door',
          },
          {
            id: 'answer_45_4',
            join: [{ node: 'node_44', toAnswer: false }],
            text: "I don't like it, I'll keep walking through some other place",
          },
        ],
      },
      {
        id: 'node_46',
        top: 3222,
        left: 3849,
        text: 'Nobody answers',
        type: 'content',
        answers: [
          {
            id: 'answer_46_0',
            join: [{ node: 'node_51', toAnswer: false }],
            text: '(push the door and go inside)',
          },
        ],
      },
      {
        id: 'node_47',
        top: 3567,
        left: 3851,
        text: 'You feel the magic. It comes from inside the hut. You can go, but with caution.',
        type: 'content',
        answers: [
          {
            id: 'answer_47_0',
            join: [{ node: 'node_50', toAnswer: false }],
            text: 'Grab my wand and enter silently',
          },
          {
            id: 'answer_47_1',
            join: [{ node: 'node_44', toAnswer: false }],
            text: 'Walk away',
          },
        ],
      },
      {
        id: 'node_48',
        top: 3858,
        left: 3851,
        text: 'You study the patterns. Every movement has to be generated at some point inside the hut.',
        type: 'content',
        answers: [
          {
            id: 'answer_48_0',
            join: [{ node: 'node_50', toAnswer: false }],
            text: 'Grab my wand and enter the hut with caution',
          },
          {
            id: 'answer_48_1',
            join: [{ node: 'node_44', toAnswer: false }],
            text: 'Walk away',
          },
        ],
      },
      {
        id: 'node_49',
        top: 4153,
        left: 3852,
        text: 'You are right, the bees are too busy, something is exciting they, something inside the hut, where they come and go from.',
        type: 'content',
        answers: [
          {
            id: 'answer_49_0',
            join: [{ node: 'node_50', toAnswer: false }],
            text: 'Grab my wand and enter the hut with caution',
          },
          {
            id: 'answer_49_1',
            join: [{ node: 'node_44', toAnswer: false }],
            text: 'Walk away',
          },
        ],
      },
      {
        id: 'node_50',
        top: 3516,
        left: 4447,
        text: "Inside the hut there is an old man gently moving a wand with the eyes closed. \n\nHe didn't see you.",
        type: 'content',
      },
      {
        id: 'node_51',
        top: 3062,
        left: 4445,
        text: 'Inside the hut there is an old man gently moving a wand with the eyes closed. \n\nHe saw you! And he points the wand towards you with fearful eyes. You hear the bees approaching fiercefully, flowers have become poisonous, and the axe is coming for your head!',
        type: 'content',
        answers: [
          {
            id: 'answer_51_0',
            join: [{ node: 'node_52', toAnswer: false }],
            text: 'Expecto patronus!',
            events: [{ action: 'alterStat', amount: 3, target: 'stat_7' }],
          },
          {
            id: 'answer_51_1',
            join: [{ node: 'node_57', toAnswer: false }],
            text: 'Hide under the invisibility cloak!\n(because you are from Griffindor)',
            events: [{ action: 'alterStat', amount: 2, target: 'stat_7' }],
          },
          {
            id: 'answer_51_2',
            join: [
              { node: 'node_53', toAnswer: false },
              { node: 'node_54', toAnswer: false },
            ],
            text: 'AVADA KEDAVRA to the old man!\n(50% of success)\n(because you are from Slytherin)',
            events: [{ action: 'alterStat', amount: 0, target: 'stat_7' }],
          },
          {
            id: 'answer_51_3',
            join: [{ node: 'node_56', toAnswer: false }],
            text: 'Shout something like "Sorry I didn\'t mean to scare you!!"',
            events: [{ action: 'alterStat', amount: 4, target: 'stat_7' }],
          },
        ],
      },
      {
        id: 'node_52',
        top: 2796,
        left: 4803,
        text: 'You are not fighting dementors! The expecto patronus is useless here! \n\nYou die. Your adventure ends in hands of a wise but frightened wizard.',
        type: 'content',
        answers: [
          {
            id: 'answer_52_0',
            join: [{ node: 'node_25', toAnswer: false }],
            text: 'Let me try again',
          },
        ],
      },
      {
        id: 'node_53',
        top: 3380,
        left: 4803,
        text: 'You did Avada kedavra to the powerful man? Nice try, but he is faster and Avada kedavras your face.\n\nYou die.',
        type: 'content',
        answers: [
          {
            id: 'answer_53_0',
            join: [{ node: 'node_25', toAnswer: false }],
            text: 'Let me try again',
          },
        ],
      },
      {
        id: 'node_54',
        top: 3452,
        join: [{ node: 'node_55', toAnswer: false }],
        left: 5122,
        text: 'This was risky, but you surprised the old man, who is now dead.\n\nYou feel powerful but misareble. Hopefuly you can handle this emotions before it is too late.',
        type: 'content',
      },
      {
        id: 'node_55',
        top: 3229,
        join: [{ node: 'node_42', toAnswer: false }],
        left: 6576,
        text: 'The hut has so many interesting things',
        type: 'content',
      },
      {
        id: 'node_56',
        top: 3061,
        left: 4803,
        text: 'Everything slows down. The old man looks at you. You are suposed to say something else...\n\n(Old man simpaty towards you: #oldManSimpaty/10)',
        type: 'content',
        answers: [
          {
            id: 'answer_56_0',
            join: [{ node: 'node_58', toAnswer: false }],
            text: 'I thought the hut was abandoned',
            events: [{ action: 'alterStat', amount: -2, target: 'stat_7' }],
          },
          {
            id: 'answer_56_1',
            join: [{ node: 'node_60', toAnswer: false }],
            text: 'I wanted to see the source of all this magic',
            events: [{ action: 'alterStat', amount: 2, target: 'stat_7' }],
          },
          {
            id: 'answer_56_2',
            join: [{ node: 'node_61', toAnswer: false }],
            text: 'I was scared of the bees, I needed to refuge',
            events: [{ action: 'alterStat', amount: 1, target: 'stat_7' }],
          },
          {
            id: 'answer_56_3',
            join: [{ node: 'node_62', toAnswer: false }],
            text: 'I wanted to take care of the flowers',
            events: [{ action: 'alterStat', amount: -1, target: 'stat_7' }],
          },
        ],
      },
      {
        id: 'node_57',
        top: 3371,
        left: 6222,
        text: 'There is a lot of confusion and caos. \n\nThe old man looks around even more frightened, the bees are all around the hut and the axe is flying and hitting everywhere.',
        type: 'content',
        answers: [
          {
            id: 'answer_57_0',
            join: [{ node: 'node_42', toAnswer: false }],
            text: 'Try to leave',
          },
          {
            id: 'answer_57_1',
            join: [{ node: 'node_42', toAnswer: false }],
            text: 'Stay very quiet',
          },
        ],
      },
      {
        id: 'node_58',
        top: 2875,
        join: [{ node: 'node_63', toAnswer: false }],
        left: 5159,
        text: "How could you think that? You didn't see the bees, the axe, the beautiful flowers?\n\n",
        type: 'content',
      },
      {
        id: 'node_60',
        top: 2956,
        join: [{ node: 'node_63', toAnswer: false }],
        left: 5158,
        text: 'I can understand the curiosity of a young mage...',
        type: 'content',
      },
      {
        id: 'node_61',
        top: 3042,
        join: [{ node: 'node_63', toAnswer: false }],
        left: 5157,
        text: "Ah that's fine. Maybe I have too much bees right now, but they are harmless.",
        type: 'content',
      },
      {
        id: 'node_62',
        top: 3125,
        join: [{ node: 'node_63', toAnswer: false }],
        left: 5158,
        text: 'This are the most beautiful flowers of all the forest, how could you think they lack some care?',
        type: 'content',
      },
      {
        id: 'node_63',
        top: 2878,
        join: [{ node: 'node_64', toAnswer: false }],
        left: 5500,
        text: '(Old man simpaty towards you: #oldManSimpaty/10)',
        type: 'content',
      },
      {
        id: 'node_64',
        top: 2851,
        left: 5841,
        type: 'distributor',
        conditions: [
          {
            id: 'condition_64_0',
            ref: 'stat_7',
            join: [{ node: 'node_65', toAnswer: false }],
            value: '3',
            comparator: 'lessthan',
          },
          {
            id: 'condition_64_1',
            ref: 'stat_7',
            join: [{ node: 'node_66', toAnswer: false }],
            value: '3',
            comparator: 'equalto',
          },
          {
            id: 'condition_64_2',
            ref: 'stat_7',
            join: [{ node: 'node_66', toAnswer: false }],
            value: '4',
            comparator: 'equalto',
          },
          {
            id: 'condition_64_3',
            ref: 'stat_7',
            join: [{ node: 'node_67', toAnswer: false }],
            value: '4',
            comparator: 'morethan',
          },
        ],
        fallbackCondition: { id: 'condition_64_fallback' },
      },
      {
        id: 'node_65',
        top: 2654,
        join: [{ node: 'node_42', toAnswer: false }],
        left: 6214,
        text: 'The old man judges you, and to his eyes, you are a burglar, a criminal who tried to enter his hut and hurt him. \n\nYou will feel the power of his magic',
        type: 'content',
      },
      {
        id: 'node_66',
        top: 2852,
        join: [{ node: 'node_42', toAnswer: false }],
        left: 6215,
        text: "The old man doesn't trust you, but he lowers the wand and all the living objects go to their tasks again.",
        type: 'content',
      },
      {
        id: 'node_67',
        top: 3055,
        join: [{ node: 'node_55', toAnswer: false }],
        left: 6219,
        text: 'The old man begins to trust you. He apologise for getting so angry and offers you some tea.\n\nWhile he is preparing the beberage, you are free to explore the insides of the place.',
        type: 'content',
      },
    ],
    categories: [{ id: 'fruit', name: 'fruit' }],
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
