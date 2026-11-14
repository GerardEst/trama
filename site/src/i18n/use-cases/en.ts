// Copy of the use cases page. Each case names the capabilities it leans on by
// their id in the landing's atlas, so their names and answers are written once.
export const useCases = {
  meta: {
    title: 'Use cases — Trama',
    description:
      'How fiction writers, narrative game makers and brands use Trama, the no-code editor for branching interactive stories: the tools that matter most to each and the plan that fits.',
  },
  eyebrow: 'Use cases',
  titleStart: 'One editor.',
  titleEnd: 'Very different stories.',
  lead: 'Trama is for any story where the reader decides. This is how fiction writers, game makers and brands use it, and the tools that matter most to each.',
  makesLabel: 'Used for',
  toolsTitle: 'The tools that matter most here',
  planLabel: 'Recommended plan',
  planLink: 'See pricing',
  cases: {
    writers: {
      name: 'Creative writers',
      title: 'Your fiction, with more than one path.',
      lead: 'For short stories, novels and gamebooks where the reader decides.',
      heading: 'Write as you always do. Branch when you want.',
      body: 'Start with one scene and one choice. The rest is writing: long passages with formatting, a full-page editor and a board that shows where every path leads. There is no language to learn, and Trama never writes the text for you.',
      makes: ['Interactive fiction', 'Gamebooks', 'Stories with several endings'],
      plan: 'Everything a writer needs is in Creative.',
    },
    games: {
      name: 'Narrative games',
      title: 'Game logic without the code.',
      lead: 'For text adventures, mysteries and narrative RPGs where the player’s state matters.',
      heading: 'The story keeps the score.',
      body: 'Every choice can add to a number, switch a condition or save a text. Answers stay locked until the player has what they need, and a distributor sends each playthrough down a different route depending on what happened before. You set it all up with forms, and the open engine plays the same story in your own game screen.',
      makes: ['Text adventures', 'Mysteries with clues', 'Narrative RPGs'],
      plan: 'Creative includes all the logic. The engine is free.',
    },
    brands: {
      name: 'Brands',
      title: 'A story your audience plays.',
      lead: 'For campaigns, launches and content where the audience chooses, and you want to know what they chose.',
      heading: 'Under your name, with the numbers.',
      body: 'Publish the story with your own footer and link instead of Trama’s, at an address that is easy to remember. Every ending can send readers on to your site. With Pro you see each playthrough: who played and what they ended with.',
      makes: ['Interactive campaigns', 'Branded stories', 'Quizzes with a result'],
      plan: 'Pro adds the analytics to everything in Creative.',
    },
  },
  scene: {
    reader: 'Morgan',
    ending: 'The end',
    visit: 'Visit our site',
  },
}

export type UseCasesCopy = typeof useCases
