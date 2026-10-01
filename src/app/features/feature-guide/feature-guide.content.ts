export interface GuideFeature {
  id: string
  title: string
  summary: string
  steps: readonly string[]
  example: { label: string; lines: readonly string[] }
  note: string
}

export interface GuideGroup {
  title: string
  description: string
  features: readonly GuideFeature[]
}

export const FEATURE_GUIDE: readonly GuideGroup[] = [
  {
    title: 'Make it react',
    description: 'Give choices consequences and let the story remember them.',
    features: [
      {
        id: 'events',
        title: 'Events on scenes and choices',
        summary:
          'Change the player’s state when they arrive at a node or choose an answer. Keep track of coins, discoveries, trust and other consequences without writing code.',
        steps: [
          'Choose Add event on a node to act when the player arrives, or on an answer to act when they choose it.',
          'Choose a numeric stat, a true/false condition or a text property. Name the reference so you can reuse it elsewhere.',
          'Set the change: add or subtract a number, turn a condition on or off, or assign a property value.',
        ],
        example: {
          label: 'A choice with a consequence',
          lines: [
            'Help the stranger → trust +1',
            'Pick up the key → has_key becomes true',
          ],
        },
        note: 'Node events run on each arrival, including repeat visits. Answer events run before the story moves to the next node.',
      },
      {
        id: 'conditional-paths',
        title: 'Paths that depend on the player',
        summary:
          'The same decision point can lead to different scenes depending on what the player has done. A trusted visitor and an unknown visitor do not have to get the same welcome.',
        steps: [
          'Use events to record a numeric stat or a true/false condition during the story.',
          'Connect the path to a distributor node that checks those references.',
          'Connect each matching route to its scene, and add an Otherwise destination for everyone else.',
        ],
        example: {
          label: 'One entrance, two experiences',
          lines: [
            'has_key is true → enter the archive',
            'Otherwise → meet the gatekeeper',
          ],
        },
        note: 'Routing checks numeric stats and true/false conditions. Player text, such as their name, can be reused in the story’s wording with interpolation.',
      },
      {
        id: 'requirements',
        title: 'Answer requirements',
        summary:
          'Make an answer available only when the player meets its requirements. A discovered key can open a door; enough coins can make a purchase possible.',
        steps: [
          'Choose Add requirement on the answer you want to restrict.',
          'Select a numeric stat and its minimum amount, or a condition that must be true or false.',
          'Add more requirements if needed. The player must meet every requirement on that answer.',
        ],
        example: {
          label: 'Earn the option',
          lines: [
            'Buy the map → requires at least 3 coins',
            'Open the archive → requires has_key',
          ],
        },
        note: 'Answers whose requirements are not met are filtered out of the current playground. Connect eligible answers to a destination so they can be chosen.',
      },
      {
        id: 'distributors',
        title: 'Distributor nodes',
        summary:
          'Build more complex routing without showing the player an extra question. A distributor evaluates its routes in order and continues through the first one that matches.',
        steps: [
          'Create a distributor node and add a route.',
          'Choose a reference and comparison. Numeric stats support equal to, less than and more than; conditions check whether they are true or false.',
          'Use Add AND rule to combine checks. Every rule on the route must match.',
          'Use Up and Down to set priority, then connect Otherwise as a fallback.',
        ],
        example: {
          label: 'Priority matters',
          lines: [
            'Route 1: trust > 2 AND has_key → secret entrance',
            'Route 2: trust > 2 → front entrance',
            'Otherwise → gatekeeper',
          ],
        },
        note: 'The first matching route wins. Put more specific routes before broader ones. A distributor is a routing step, not a scene the player reads.',
      },
      {
        id: 'connections',
        title: 'Connect to text or directly to answers',
        summary:
          'Choose whether a connection shows the next node’s passage or jumps straight to its answers. Return to a menu without making the player reread its introduction.',
        steps: [
          'Drag a connection from a node, answer or distributor route to its destination.',
          'Connect to the destination node’s main input to show its text and then its answers.',
          'Connect to the answers input to skip the passage and offer the choices directly.',
        ],
        example: {
          label: 'Two ways back to the same scene',
          lines: [
            'First visit → market text + shopping choices',
            'Return from a shop → shopping choices only',
          ],
        },
        note: 'If an answers-only destination has no available answers, the playground shows its passage instead. Node events still run when you arrive.',
      },
    ],
  },
  {
    title: 'Make it personal',
    description:
      'Bring the reader into the story, then give them a world to step inside.',
    features: [
      {
        id: 'player-input',
        title: 'Ask the player for text',
        summary:
          'Ask for a name, a thought or another written response and keep it available throughout that playthrough. The reader’s words become part of your story.',
        steps: [
          'Create a text-input node and write the question in its Prompt field.',
          'Set Property to a key such as name. This is where the player’s response is stored.',
          'Set a placeholder if useful, and connect the node to the next scene.',
          'Reuse that property in later scenes or answers with a variable token.',
        ],
        example: {
          label: 'A name that travels with the reader',
          lines: [
            'Prompt: What should we call you?',
            'Property: name · Player writes: Morgan',
            'Later: Welcome back, #name. → Welcome back, Morgan.',
          ],
        },
        note: 'The response belongs to the current playthrough. The playground currently uses a fixed Continue button; the saved Button text and Description fields are not displayed there yet.',
      },
      {
        id: 'variables',
        title: 'Variables inside your text',
        summary:
          'Let the wording adapt to the player. Insert a name, a numeric stat or a condition into a passage or an answer rather than writing a separate scene for every variation.',
        steps: [
          'Create the reference with an event, or store a player response in a text-input property.',
          'Open focus mode and use Insert variable to choose the reference by name.',
          'Place the token wherever its current value should appear in a scene or answer.',
        ],
        example: {
          label: 'From a token to a sentence',
          lines: [
            'You made it, #name.',
            'Player property name = Morgan',
            'The reader sees: You made it, Morgan.',
          ],
        },
        note: 'Plain text also supports #variable syntax. For a property named name, use #name; numeric stats and conditions use their reference IDs in plain text. The variable picker handles those IDs for you. Missing values display as a dash.',
      },
      {
        id: 'images',
        title: 'Images in your nodes',
        summary:
          'Set the scene with an illustration, a character portrait or a visual clue. An image sits alongside the writing rather than replacing your choices.',
        steps: [
          'Open the menu on a content, text-input or end node and choose Add image.',
          'Choose an image file and wait for the upload to finish.',
          'Preview the story: the image appears above the node’s passage.',
        ],
        example: {
          label: 'A visual clue',
          lines: [
            'Image: a letter with a broken seal',
            'Passage: The handwriting looks familiar.',
            'Choices: Read it / Hide it',
          ],
        },
        note: 'Distributor nodes are for routing and do not have an image field. Basic has image limits; Creator includes unlimited images.',
      },
      {
        id: 'share-node',
        title: 'Share and end nodes',
        summary:
          'Give an ending somewhere to go next. Invite the reader to share the adventure, discover your work or visit your social profiles.',
        steps: [
          'Create an end node and write the final passage.',
          'Enable sharing in the story settings to offer Share this story.',
          'Use Share customizations to set the message and button label for that ending.',
          'On a paid subscription, add External links with your own labels and URLs, such as your website or creator profiles.',
        ],
        example: {
          label: 'After the final scene',
          lines: [
            'Share button: Pass this adventure on',
            'Shared message: I found the secret entrance. Can you?',
            'External links: More stories / Meet the creator',
          ],
        },
        note: 'Sharing uses the device’s share sheet when available, with a copy-link fallback. External links require a paid subscription. These are links to your profiles, not built-in integrations with each social network.',
      },
    ],
  },
  {
    title: 'Keep writing',
    description:
      'Go deep into a passage without losing the shape of the whole adventure.',
    features: [
      {
        id: 'focus-mode',
        title: 'Focus mode for long passages',
        summary:
          'Step away from the canvas and into a distraction-free text editor. Write a long passage, format it and return to the map when you are ready.',
        steps: [
          'Use the expand button on a scene’s text field or an answer to open focus mode.',
          'Write with bold, italic and variable tokens. Scene passages also support headings and lists.',
          'Choose Close, or press Escape, to apply your writing back to the node.',
        ],
        example: {
          label: 'From map to manuscript',
          lines: [
            'Open a scene → expand its text field',
            'Write the whole passage without canvas clutter',
            'Close → return to the same story map',
          ],
        },
        note: 'Ctrl+F or ⌘F opens focus mode while a story text field is active. Answer fields use a simpler inline-formatting toolbar.',
      },
      {
        id: 'organisation',
        title: 'Groups and movable frames',
        summary:
          'Keep a large story understandable. Collapse a chapter into a group, or keep its scenes visible inside a named frame that moves with them.',
        steps: [
          'Select related nodes on the canvas.',
          'Choose Group selected nodes to place them inside a group. Open the group to work on its contents and use Exit to return.',
          'Choose Frame selected nodes instead to keep them visible together on the same board. Name the frame and drag its header to move the collection.',
          'Remove a frame when you no longer need it; its nodes remain in the story.',
        ],
        example: {
          label: 'Two ways to organise Chapter 2',
          lines: [
            'Group → one container, with scenes inside',
            'Frame → all scenes visible, moved together',
          ],
        },
        note: 'Groups and frames are editor organisation tools, not playable scenes. They do not change the story’s logic. The starting node stays on the main board rather than inside a group.',
      },
    ],
  },
]
