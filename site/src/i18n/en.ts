export const landing = {
  meta: {
    title: 'Trama — You write the story. They choose the way.',
    description:
      'Write interactive fiction without coding. Connect scenes and choices, test their consequences, revise as you play, and share your story with a link.',
  },
  nav: {
    label: 'Main navigation',
    home: 'Trama home',
    skip: 'Skip to content',
    authoring: 'How it works',
    features: 'Features',
    engine: 'Open source',
    docs: 'Docs',
    login: 'Log in',
    dashboard: 'Dashboard',
    start: 'Start writing',
  },
  hero: {
    eyebrow: 'FOR INTERACTIVE FICTION AUTHORS',
    titleStart: 'You write the story.',
    titleEnd: 'They choose the way.',
    description:
      'Write scenes, connect choices and test how each path changes the story. Revise passages as you play, then share your interactive story with a link. No coding.',
    openDashboard: 'Open your dashboard',
    startStory: 'Create your first story',
    tryStory: 'Play a story',
    free: '✓ All editor features included',
    noAccount: '✓ Readers don’t need an account',
    demoLabel: 'Play The Last Threshold',
  },
  demo: {
    heading: 'A REAL STORY. YOUR NEXT MOVE.',
    titleStart: 'THE LAST',
    titleEnd: 'THRESHOLD',
    endingStart: 'That ending was yours.',
    endingEnd: 'Now write someone else’s beginning.',
    makeAnother: 'Make another story',
    createFirst: 'Create your first story',
    ended: 'Every choice leads somewhere else.',
    intro: 'No sign-up. Pick a path.',
    restart: 'Start over',
  },
  demoBridge: {
    description: 'Freeing the spirit or taking the moon sigil changes what you can do later. You decide which choices your story remembers.',
    action: 'See how it’s built',
  },
  authoring: {
    eyebrow: 'YOUR STORY, STEP BY STEP',
    title: 'From your first scene to a story worth sharing.',
    description: 'Write the passages. Shape the paths on the map. Play through them and revise along the way, without leaving your story.',
    enlarge: 'Open the editor screenshot at full size (new tab)',
    realCapture: 'Real editor · Example story',
    write: {
      title: 'Write',
      description: 'Give long passages room to breathe in the text editor.',
      caption: 'Edit passages and answers in the reading pane. Create new scenes and connections on the map.',
      alt: 'Trama’s editor with the story map beside an editable passage and its answers.',
    },
    map: {
      title: 'Connect',
      description: 'Link choices to scenes and organise your paths on the map.',
      caption: 'The board shows scenes, answers and the connections between them.',
      alt: 'Trama’s board showing connected scenes and two different paths through an example story.',
    },
    preview: {
      title: 'Test and revise',
      description: 'Follow a path, go back and switch to editing when a passage needs work.',
      caption: 'The preview follows your story alongside the map. Switch to Edit to revise the current passage.',
      alt: 'Trama’s reading preview beside the map, with choices, a Back button and an Edit button.',
    },
    share: {
      title: 'Share',
      description: 'Send readers a direct link. They don’t need an account.',
      caption: 'Copy your story’s link from the sharing window and send it to your readers.',
      alt: 'Trama’s sharing window showing a story link and its Copy button.',
    },
  },
  trust: {
    eyebrow: 'MADE BY YOU',
    title: 'You bring the voice. Trama brings the tools.',
    description: 'The words, the characters and the choices come from you. Trama doesn’t generate the text for you.',
    saving: {
      title: 'See when your work is saved',
      description: 'Changes save automatically. If a save fails, the editor shows a warning and lets you retry.',
    },
    history: {
      title: 'Change your mind',
      description: 'Undo and redo recent edits while you work. Session history is not a permanent version archive.',
    },
    data: {
      title: 'Download your story’s data',
      description: 'Download a JSON file from the story options. It contains text, structure and configuration, not a standalone playable game or bundled images.',
    },
  },
  features: {
    eyebrow: 'BEYOND BRANCHING',
    titleStart: 'Stories that',
    titleEnd: 'remember.',
    description:
      'A promise kept, a key found, a friendship earned. Let earlier choices change what happens next, without writing code.',
    readGuide: 'Read the docs',
    events: {
      label: 'EVENTS',
      title: 'Choices with consequences',
      description:
        'Track coins, discoveries, trust and anything else your story needs to remember. Every scene and every answer can change the player’s state, no code required.',
      link: 'See how events work',
    },
    distributors: {
      label: 'DISTRIBUTORS',
      title: 'The past changes what happens next',
      description:
        'A trusted ally welcomes the reader. A stranger must find another way in. Set up different routes based on what the reader has done.',
      link: 'Meet distributor nodes',
    },
    playerInput: {
      label: 'PLAYER INPUT',
      title: 'Make room for the reader in your story',
      description:
        'Ask for a name or a thought, then weave it into later passages with a variable.',
      link: 'Ask the player',
    },
    requirements: {
      label: 'REQUIREMENTS',
      title: 'Some choices only open later',
      description:
        'A discovered key opens the door. Enough coins buy the map. Answers only appear once the player meets every requirement.',
      link: 'Add requirements',
    },
    focusMode: {
      label: 'FOCUS MODE',
      title: 'Room to write',
      description:
        'Step off the canvas into a distraction-free editor for long passages, with headings, lists and variables. Close it and you are back on the same map.',
      link: 'Try focus mode',
    },
    organisation: {
      label: 'GROUPS & FRAMES',
      title: 'Give each chapter its place',
      description:
        'Collapse a chapter into a group, or keep it visible inside a movable frame.',
      link: 'Organise your board',
    },
  },
  engine: {
    eyebrow: 'OPEN SOURCE · TRAMA ENGINE',
    titleStart: 'Your story,',
    titleEnd: 'in any interface.',
    description:
      'Trama Engine is the engine that plays every Trama story, now free and open source. Load a story by its id and draw it however you like: a terminal, a game screen, a chat, an illustrated book. Trama’s reader becomes just one option.',
    points: {
      same: {
        title: 'The same engine as Trama',
        description: 'Events, distributors, requirements and variables behave exactly as they do in Trama’s reader.',
      },
      design: {
        title: 'Your design, no limits',
        description: 'It decides what happens next. You decide how it looks. No interface included and no dependencies.',
      },
      live: {
        title: 'Written in Trama, played anywhere',
        description: 'Your interface loads the story from Trama, so your changes in the editor reach it without exporting anything.',
      },
    },
    agent: {
      label: 'WITH AN AI AGENT',
      title: 'Ask your agent',
      description:
        'Paste your story’s link and give the prompt to your coding agent. It will build an interface with Trama Engine and your readers will play the way you want, without being limited by Trama’s reader.',
      storyLabel: 'Story link or id',
      storyHint: 'Copy the link from your story’s sharing window.',
      storyInvalid: 'That doesn’t look like a Trama story link, id or custom address.',
      placeholderId: 'YOUR_STORY_ID',
      promptLabel: 'Prompt for your agent',
      prompt:
        'Build a web page where readers play my interactive story. Use the @trama-app/engine npm package (read its README: {npm}). Load the story with fetchStory({reference}) and play it with createGame. Design the interface however you like: it does not have to look like Trama’s reader.',
      copy: 'Copy prompt',
      copied: 'Prompt copied',
      copyFailed: 'Could not copy it. Select the text and copy it by hand.',
    },
    code: {
      label: 'WITH CODE',
      title: 'Or write it yourself',
      description: 'Install the package, load your story and draw each state your way. It runs in browsers, Node 18+, Deno and workers.',
      codeLabel: 'Example code',
    },
    links: {
      npm: 'View on npm',
      source: 'Read the source',
      license: 'MIT license · free for any project',
    },
  },
  visuals: {
    distributor: 'Distributor',
    secretRule: 'trust > 2 AND has_key',
    secretEntrance: 'Secret entrance',
    frontRule: 'trust > 2',
    frontEntrance: 'Front entrance',
    otherwise: 'Otherwise',
    gatekeeper: 'Gatekeeper',
    askName: 'What should we call you?',
    welcomeBack: 'Welcome back,',
    nameToken: '#name',
    coins: 'coins 2',
    hasKey: 'has_key ✓',
    openArchive: 'Open the archive',
    requiresKey: 'requires has_key',
    buyMap: 'Buy the map',
    requiresCoins: 'requires 3 coins',
    walkAway: 'Walk away',
    close: 'Close',
    chapterHeading: 'Chapter 2 · The Archive',
    passageStart:
      'The door gave way with a sigh, as if it had been waiting for',
    passageEnd:
      'all along. Dust drifted through the lantern light, settling on shelves that ran deeper than the building should allow.',
    chapter2: 'Chapter 2',
    chapter3: 'Chapter 3',
    scenes: '6 scenes',
  },
  questions: {
    title: 'A few loose ends.',
    code: {
      question: 'Do I need to know how to code?',
      answer: 'No. Write passages in the text editor, connect scenes on the board and set up events and requirements visually. The documentation explains the tools with examples.',
    },
    readers: {
      question: 'Do readers need an account?',
      answer: 'No. Share a link and readers can jump straight into your story without signing up or installing anything.',
    },
    download: {
      question: 'Can I download my story’s data?',
      answer: 'Yes. Open the story options in the dashboard and choose Export JSON. The file includes the text, structure and configuration. Images remain external references; it does not bundle them. There is not yet a user-facing import or restore tool.',
    },
    export: {
      question: 'Can I host a playable story on my own website?',
      answer: 'Yes, with Trama Engine. It is open source: build your own interface on your website and it loads the story from Trama by its id, so the story stays in Trama. The JSON download is story data, not a standalone HTML game.',
    },
    create: {
      question: 'What can I create with Trama?',
      answer: 'Interactive fiction and branching adventures with meaningful consequences. Start with a scene, give the reader a choice and decide what the story remembers.',
    },
  },
  player: {
    unavailable: 'Unavailable',
    stat: 'Requires {name}: at least {amount} (you have {current})',
    condition: 'Requires: {name}',
    absentCondition: 'Requires not having: {name}',
    unknown: 'A requirement is not met',
    yourAnswer: 'Your answer',
    continue: 'Continue',
  },
  closing: {
    label: 'YOUR NEXT SCENE',
    titleStart: 'What happens',
    titleEnd: 'next?',
    yours: 'That part is yours to write.',
  },
  footer: {
    language: 'Language',
    tagline: 'Stories don’t have to go in a straight line.',
    guide: 'Docs',
    login: 'Log in',
    email: 'Email the maker',
    rights: '© trama.app · All rights reserved',
  },
}

export type Copy = typeof landing
