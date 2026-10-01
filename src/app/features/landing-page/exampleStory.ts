import { tree } from 'src/app/core/interfaces/interfaces'

// A short, playable story that powers both the landing-page canvas and its live preview.
export const exampleStory = {
  refs: {},
  nodes: [
    {
      id: 'node_0',
      name: 'The open book',
      type: 'content',
      top: 4500,
      left: 680,
      text: 'The library closes at midnight. One book remains open on the table. Its last page is blank. What do you do?',
      answers: [
        { id: 'write', text: 'Write the first line', join: [{ node: 'node_1' }] },
        { id: 'turn', text: 'Turn the page', join: [{ node: 'node_2' }] },
      ],
    },
    {
      id: 'node_1',
      name: 'A door in the rain',
      type: 'content',
      top: 4360,
      left: 1080,
      text: 'As you write, the room fills with the smell of rain. A door appears where there was only a wall.',
      answers: [
        { id: 'door', text: 'Open the door', join: [{ node: 'node_3' }] },
      ],
    },
    {
      id: 'node_2',
      name: 'A note to yourself',
      type: 'content',
      top: 4870,
      left: 1080,
      text: 'A note in your handwriting waits on the next page: “You were always going to look here.”',
      answers: [
        { id: 'note', text: 'Read the note', join: [{ node: 'node_4' }] },
      ],
    },
    {
      id: 'node_3',
      name: 'An unwritten city',
      type: 'end',
      top: 4360,
      left: 1480,
      text: 'Outside, a city of unwritten stories is waiting for you. This one was yours to choose.',
    },
    {
      id: 'node_4',
      name: 'Only the beginning',
      type: 'end',
      top: 4870,
      left: 1480,
      text: 'The note says: “The best stories don’t end on the page.” Yours has only just begun.',
    },
  ],
} satisfies Partial<tree>
