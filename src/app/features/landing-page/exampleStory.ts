export const exampleStory = {
  refs: {
    stat_4: {
      name: 'banana',
      type: 'stat',
    },
    stat_5: {
      name: 'coins',
      type: 'stat',
    },
    condition_1: {
      name: 'wentToNodeB',
      type: 'condition',
    },
    condition_2: {
      name: 'wentToNodeA',
      type: 'condition',
    },
    condition_3: {
      name: 'isInigoMontoya',
      type: 'condition',
    },
  },
  nodes: [
    {
      id: 'node_0',
      top: 4502,
      left: 743,
      text: 'Interact with your users with the easiest tools, as easy as joining nodes and as complex as you want it to be.',
      answers: [
        {
          id: 'answer_0_1',
          join: [
            {
              node: 'node_1',
              toAnswer: false,
            },
          ],
          text: 'Click me! I will take you to the next node',
        },
      ],
    },
    {
      id: 'node_1',
      top: 4500,
      left: 1083,
      text: 'Well done! We went to the next node.\n\nYou can also easily send users to one place or another simply joining answers',
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
          events: [
            {
              action: 'alterCondition',
              amount: 1,
              target: 'condition_2',
            },
          ],
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
          events: [
            {
              action: 'alterCondition',
              amount: 1,
              target: 'condition_1',
            },
          ],
        },
      ],
    },
    {
      id: 'node_2',
      top: 4488,
      join: [
        {
          node: 'node_13',
          toAnswer: false,
        },
      ],
      left: 1407,
      text: 'Hello from node A!',
      type: 'content',
    },
    {
      id: 'node_3',
      top: 4664,
      join: [
        {
          node: 'node_13',
          toAnswer: false,
        },
      ],
      left: 1406,
      text: 'Hello from node B!',
      type: 'content',
    },
    {
      id: 'node_12',
      top: 4672,
      left: 3932,
      text: 'Thanks for playing this preview example!\n\nStart creating and feel free to contact me if you have any request, doubt or suggestion on hello@textandplay.com',
      type: 'end',
      links: [
        {
          url: 'textandplay.com/dashboard',
          name: 'Start creating something!',
        },
      ],
      share: {
        sharedText:
          'Take a look at this example of dynamic stories that can be done in textandplay.com',
        shareButtonText: 'Share this test',
      },
    },
    {
      id: 'node_13',
      top: 4520,
      join: [
        {
          node: 'node_14',
          toAnswer: false,
        },
      ],
      left: 1717,
      text: "Let's try to use some user data to customize the user experience.\n\nWhat's your name?",
      type: 'text',
      userTextOptions: {
        property: 'id',
        placeholder: 'Your name',
      },
    },
    {
      id: 'node_14',
      top: 4520,
      left: 2005,
      text: 'Nice to meet you #id!\n\nFrom now on, I can use your name in the story. Even in the selectors, look ⬇️',
      type: 'content',
      answers: [
        {
          id: 'answer_14_0',
          join: [
            {
              node: 'node_15',
              toAnswer: false,
            },
          ],
          text: 'My name is #id',
          events: [
            {
              action: 'alterStat',
              amount: 10,
              target: 'stat_5',
            },
          ],
        },
        {
          id: 'answer_14_1',
          join: [
            {
              node: 'node_27',
              toAnswer: false,
            },
          ],
          text: 'My name is Iñigo Montoya',
          events: [
            {
              action: 'alterCondition',
              amount: 1,
              target: 'condition_3',
            },
            {
              action: 'alterStat',
              amount: 10,
              target: 'stat_5',
            },
          ],
        },
      ],
    },
    {
      id: 'node_15',
      top: 4515,
      left: 2315,
      text: "Nice to meet you again 😉\n\nNow, we will save some counters that you could use later. Let's buy some bananas! Let's say you have 10 coins and each banana cost 1 coin.",
      type: 'content',
      answers: [
        {
          id: 'answer_15_0',
          join: [
            {
              node: 'node_16',
              toAnswer: false,
            },
          ],
          text: '🍌 Buy one banana',
          events: [
            {
              action: 'alterStat',
              amount: 1,
              target: 'stat_4',
            },
            {
              action: 'alterStat',
              amount: -1,
              target: 'stat_5',
            },
          ],
        },
        {
          id: 'answer_15_2',
          join: [
            {
              node: 'node_17',
              toAnswer: false,
            },
          ],
          text: 'Stop buying things',
          requirements: [
            {
              id: 'stat_4',
              type: 'stat',
              amount: 1,
            },
          ],
        },
      ],
    },
    {
      id: 'node_16',
      top: 4360,
      join: [
        {
          node: 'node_15',
          toAnswer: true,
        },
      ],
      left: 2623,
      text: 'Now you have #stat_4 bananas and #stat_5 coins left.\n\nDo you want to buy more?',
      type: 'content',
    },
    {
      id: 'node_17',
      top: 4626,
      join: [
        {
          node: 'node_23',
          toAnswer: false,
        },
      ],
      left: 2630,
      text: 'You bought #stat_4 bananas, and there are #stat_5 coins in your pocket.',
      type: 'content',
    },
    {
      id: 'node_19',
      top: 4427,
      join: [
        {
          node: 'node_26',
          toAnswer: false,
        },
      ],
      left: 3259,
      text: "That's a lot of bananas! What are you gonna do with those?",
      type: 'text',
      userTextOptions: {
        property: 'useOfThings',
        placeholder: '',
      },
    },
    {
      id: 'node_23',
      top: 4586,
      left: 2943,
      type: 'distributor',
      conditions: [
        {
          id: 'condition_23_0',
          ref: 'stat_4',
          join: [
            {
              node: 'node_19',
              toAnswer: false,
            },
          ],
          value: '4',
          comparator: 'morethan',
        },
        {
          id: 'condition_23_1',
          ref: 'stat_4',
          join: [
            {
              node: 'node_24',
              toAnswer: false,
            },
          ],
          value: '2',
          comparator: 'lessthan',
        },
      ],
      fallbackCondition: {
        id: 'condition_23_fallback',
        join: [
          {
            node: 'node_25',
            toAnswer: false,
          },
        ],
      },
    },
    {
      id: 'node_24',
      top: 4654,
      join: [
        {
          node: 'node_26',
          toAnswer: false,
        },
      ],
      left: 3259,
      text: "Well, you don't have many bananas, but you are rich!\n\nWhat will you do with those #stat_5 coins?",
      type: 'text',
      userTextOptions: {
        property: 'useOfThings',
        placeholder: '',
      },
    },
    {
      id: 'node_25',
      top: 4882,
      join: [
        {
          node: 'node_26',
          toAnswer: false,
        },
      ],
      left: 3260,
      text: 'You got #stat_4 bananas. What you gonna do with those?',
      type: 'text',
      userTextOptions: {
        property: 'useOfThings',
        placeholder: '',
      },
    },
    {
      id: 'node_26',
      top: 4686,
      left: 3572,
      text: "It's a legitimate use.\n\nTo end with this preview, let's see some of the information we gathered from your actions:\n\nYou went to node A? #condition_2\nYou went to node B? #condition_1\nYou stated you are Iñigo Montoya? #condition_3\nYou have #stat_5 coins\nYou have #stat_4 bananas\nAnd you said: \n#useOfThings\n\nApart from using that data inside the current story to customize the experience, this will also be saved in your analytics page, so you will have the stats you want for every player of your stories, maybe to evaluate some exams, to know your users better, to gain customized insights, etc.",
      type: 'content',
      answers: [
        {
          id: 'answer_26_0',
          join: [
            {
              node: 'node_12',
              toAnswer: false,
            },
          ],
          text: 'Nice!',
        },
      ],
    },
    {
      id: 'node_27',
      top: 4841,
      join: [
        {
          node: 'node_15',
          toAnswer: true,
        },
      ],
      left: 2158,
      text: "Oh! Ok so you are not #id anymore. Hello Iñigo Montoya.\n\nNow, we will save some counters that you could use later. Let's buy some bananas! Let's say you have 10 coins and each banana cost 1 coin.",
      type: 'content',
    },
  ],
}
