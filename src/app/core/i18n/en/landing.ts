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
    pricing: 'Pricing',
    docs: 'Docs',
    login: 'Log in',
    dashboard: 'Dashboard',
    start: 'Choose Creator',
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
    noCard: '✓ Monthly or annual billing',
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
  pricing: {
    titleStart: 'Create with Creator.',
    titleEnd: 'Pro comes next.',
    description: 'Creator includes all current editor features. The billing selector applies only to Creator. Pro is a planned one-time purchase, not yet on sale.',
  },
  questions: {
    title: 'A few loose ends.',
    code: {
      question: 'Do I need to know how to code?',
      answer: 'No. Write passages in the text editor, connect scenes on the board and set up events and requirements visually. The documentation explains the tools with examples.',
    },
    free: {
      question: 'Which plans are available?',
      answer: 'Creator is available with monthly or annual billing and all current editor features included. Pro is planned as a one-time purchase of around 200€ with story export, but is not available yet. Its price, export format and scope are not final.',
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
      answer: 'Not yet. Today readers play through a Trama link. The JSON download is story data, not a standalone HTML game. Playable export is planned for Pro, but its format, scope and launch date are still undecided.',
    },
    cancel: {
      question: 'What if I cancel Creator?',
      answer: 'You can request cancellation from your account. Download your story data as JSON before changing plans. If you need to confirm the effective cancellation date or access to your stories and links, contact us before cancelling. Pro is a separate future offer, not an automatic migration.',
      contact: 'Ask about your subscription',
    },
    create: {
      question: 'What can I create with Trama?',
      answer: 'Interactive fiction and branching adventures with meaningful consequences. Start with a scene, give the reader a choice and decide what the story remembers.',
    },
  },
  closing: {
    label: 'YOUR NEXT SCENE',
    titleStart: 'What happens',
    titleEnd: 'next?',
    yours: 'That part is yours to write.',
  },
  footer: {
    tagline: 'Stories don’t have to go in a straight line.',
    guide: 'Docs',
    pricing: 'Pricing',
    login: 'Log in',
    email: 'Email the maker',
    rights: '© trama.app · All rights reserved',
  },
}
