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
    title: 'Logic and player state',
    description: 'Configure state changes, answer requirements and connections between nodes.',
    features: [
      {
        id: 'content-nodes',
        title: 'Content nodes',
        summary:
          'A content node is a scene: it shows a passage and can offer answers that let the player choose their path.',
        steps: [
          'Create a content node on the board and write its passage.',
          'Add answers for the choices the player can make.',
          'Connect each answer to its destination node. If there are no answers, connect the node directly to the next scene.',
        ],
        example: {
          label: 'A scene with two paths',
          lines: [
            'Passage: You reach a crossroads.',
            'Answer: Enter the forest → forest scene',
            'Answer: Follow the river → river scene',
          ],
        },
        note: 'You can also add an image and events to the scene. Answers need a connected destination to be playable; requirements can limit which answers are available.',
      },
      {
        id: 'events',
        title: 'Events on scenes and choices',
        summary:
          'Events modify numeric stats, conditions or text properties when the player arrives at a node or selects an answer.',
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
        title: 'Conditional paths',
        summary:
          'Use a distributor to select the next node based on the value of a numeric stat or a player condition.',
        steps: [
          'Use events to record a numeric stat or a true/false condition during the story.',
          'Connect the path to a distributor node that checks those references.',
          'Connect each matching route to its scene, and add an Otherwise destination for everyone else.',
        ],
        example: {
          label: 'Example: routing by a condition',
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
          'Requirements restrict an answer’s availability based on a minimum numeric value or a true/false condition. Every requirement on the answer must be met.',
        steps: [
          'Choose Add requirement on the answer you want to restrict.',
          'Select a numeric stat and its minimum amount, or a condition that must be true or false.',
          'Add more requirements if needed. The player must meet every requirement on that answer.',
        ],
        example: {
          label: 'Example: requirements on two answers',
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
          label: 'Example: route order',
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
    title: 'Text, images and sharing',
    description:
      'Collect player text, insert values into passages and configure images and sharing options.',
    features: [
      {
        id: 'player-input',
        title: 'Ask the player for text',
        summary:
          'A text-input node stores the player’s written response in a property for the current playthrough. This property can be reused in scenes and answers.',
        steps: [
          'Create a text-input node and write the question in its Prompt field.',
          'Set Property to a key such as name. This is where the player’s response is stored.',
          'Set a placeholder if useful, and connect the node to the next scene.',
          'Reuse that property in later scenes or answers with a variable token.',
        ],
        example: {
          label: 'Example: storing and displaying a name',
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
          'Variables display the current value of a property, numeric stat or condition within the text of a scene or an answer.',
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
        title: 'Images in nodes',
        summary:
          'Content, text-input and end nodes can display an image above the passage. Distributor nodes do not support images.',
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
          'End nodes can offer a story-sharing button and external links. The message and button label are configured for each ending.',
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
    title: 'Editing and board organisation',
    description:
      'Edit passages in an expanded view and organise nodes with groups or frames.',
    features: [
      {
        id: 'focus-mode',
        title: 'Focus mode for long passages',
        summary:
          'Focus mode expands a scene or answer text field and provides formatting and variable-insertion tools.',
        steps: [
          'Use the expand button on a scene’s text field or an answer to open focus mode.',
          'Write with bold, italic and variable tokens. Scene passages also support headings and lists.',
          'Choose Close, or press Escape, to apply your writing back to the node.',
        ],
        example: {
          label: 'Example: editing a passage',
          lines: [
            'Open a scene → expand its text field',
            'Edit and format the text in the expanded view',
            'Close → return to the same story map',
          ],
        },
        note: 'Ctrl+F or ⌘F opens focus mode while a story text field is active. Answer fields use a simpler inline-formatting toolbar.',
      },
      {
        id: 'organisation',
        title: 'Groups and movable frames',
        summary:
          'Groups contain nodes on an internal board. Frames keep nodes visible on the current board and let you move them together.',
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
        note: 'Groups and frames are editor organisation tools, not playable scenes. They do not change the story’s logic. The Start marker stays on the main board and can point to a scene inside a group.',
      },
    ],
  },
]
