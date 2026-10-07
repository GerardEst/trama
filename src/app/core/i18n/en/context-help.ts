export const contextHelp = {
  preference: 'Show contextual help',
  explain: 'Help: {topic}',
  documentation: 'View in the documentation',
  newTab: 'Opens in a new tab',
  topics: {
    contentNode: {
      body: 'A content node is a scene in your story. Write the passage the player will read and add answers so they can choose what happens next. Connect each answer to another node to create different paths. Without answers, you can connect the node directly to the next scene.',
    },
    textNode: {
      body: 'This node asks the player an open-ended question and saves their written response in a playthrough property. Choose a property, such as name, and connect the node to the next scene. Later, you can insert the response into the story’s text with a variable.',
    },
    distributorNode: {
      body: 'This node automatically chooses the next path without showing a scene to the player. It checks routes in order using stats or conditions and follows the first matching route. Connect the Otherwise output for cases where no route matches.',
    },
    endNode: {
      body: 'This node marks the end of a story path and shows the final passage to the player. You can create different endings based on their choices. You can also configure story-sharing options and, with a paid subscription, add external links.',
    },
    events: {
      title: 'Events',
      body: 'Events change the player’s state when a passage or answer is played. They can add or subtract a stat, activate or deactivate a condition, or set a text property. For example, an answer can give the player a key for later use.',
    },
    requirements: {
      title: 'Requirements',
      body: 'Requirements decide whether an answer is available to the player. You can require a minimum stat value or a condition to be active or inactive. All requirements must be met. For example, a door can only be opened if the player has a key.',
    },
    references: {
      title: 'Stats, conditions and properties',
      body: 'These are the values your story remembers about the player. Stats hold amounts, such as coins; conditions are active or inactive, such as having a key; properties hold text, such as a name. Reuse the same reference in events and checks to connect different parts of the story.',
    },
  },
}
