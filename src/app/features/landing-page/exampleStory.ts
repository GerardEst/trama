import { node_answer, tree } from 'src/app/core/interfaces/interfaces'
import { Lang } from 'src/app/core/i18n/i18n.types'
import { exampleStoryEs } from './exampleStory.es'
import { exampleStoryCa } from './exampleStory.ca'

type Skill = 'blade' | 'shadow' | 'ember'

// Every translation fills the same story structure, so all languages play alike.
export interface ExampleStoryCopy {
  title: string
  refs: Record<Skill | 'spirit' | 'sigil' | 'title' | 'deed', string>
  titles: Record<Skill, string>
  skills: Record<Skill, { answer: string; deed: string }>
  retreat: string
  nodes: {
    citadel: { name: string; text: string } & Record<Skill, string>
    bridge: { name: string; text: string; free: string; cut: string }
    stair: { name: string; text: string; steal: string; hide: string }
    gate: { name: string; text: string; tame: string; walk: string }
    light: { name: string; text: string; approach: string }
    sigil: { name: string; text: string; carry: string }
    haste: { name: string; text: string; face: string }
    brought: { name: string }
    guardianLight: { name: string; text: string; speak: string; deed: string }
    guardianKey: { name: string; text: string; fit: string; deed: string }
    guardianAlone: { name: string; text: string }
    kindness: { name: string }
    promise: { name: string; text: string }
    nextGuardian: { name: string; text: string }
    ownName: { name: string; text: string }
  }
}

export const exampleStoryEn: ExampleStoryCopy = {
  title: 'The Last Threshold',
  refs: {
    blade: 'Blade',
    shadow: 'Shadow',
    ember: 'Ember',
    spirit: 'Freed lantern-spirit',
    sigil: 'Stolen moon sigil',
    title: 'Forgotten title',
    deed: 'Final deed',
  },
  titles: {
    blade: 'the Last Blade',
    shadow: 'the Unseen',
    ember: 'the Ember Keeper',
  },
  skills: {
    blade: {
      answer: 'Sever its shadow with your blade',
      deed: 'Your blade severs the shadow binding the throne.',
    },
    shadow: {
      answer: 'Slip into its shadow and strike',
      deed: 'You slip through its shadow and shatter the darkness from within.',
    },
    ember: {
      answer: 'Burn the darkness with your last ember',
      deed: 'Your last ember burns the darkness out of the crown.',
    },
  },
  retreat: 'Leave the crown. Choose the dawn.',
  nodes: {
    citadel: {
      name: 'At last, the citadel',
      text: 'After years following a voice in your dreams, you reach the Hollow Citadel. Beneath your hood, an old scar burns. You remember no name, only a promise: reach the crown before dawn. Three ways in. One gift you still trust.',
      blade: 'Blade — cross the bridge of sentries',
      shadow: 'Shadow — climb the haunted stair',
      ember: 'Ember — enter the gate of living fire',
    },
    bridge: {
      name: 'The bridge of sentries',
      text: 'Stone sentries raise their swords. Behind them, a lantern-spirit hangs in chains. Your blade finds the weak point: one stroke can free it, or drop the bridge and its guardians into the abyss.',
      free: 'Fight through. Cut the spirit free.',
      cut: 'Cut the bridge loose. Leap alone.',
    },
    stair: {
      name: 'The haunted stair',
      text: 'Hungry ghosts sweep the stair. You slip between their shadows, unseen. A moon sigil glints in their keeper’s hand; beside it, a trapped lantern-spirit flickers. You can take one before they turn.',
      steal: 'Steal the moon sigil',
      hide: 'Hide the spirit in your shadow',
    },
    gate: {
      name: 'The gate of living fire',
      text: 'The gate breathes fire. A moon sigil holds its jaws apart. The ember in your palm can quiet the flames long enough to take it, or turn their fury into a path straight through.',
      tame: 'Tame the fire. Take the sigil.',
      walk: 'Walk through the blaze',
    },
    light: {
      name: 'A light remembers',
      text: 'You clear the danger with a small light beside you. “They called you #property_title,” the spirit whispers. “You came here once to break the crown. This time, let me help.” Beyond the inner door, something wakes.',
      approach: 'Approach the throne together',
    },
    sigil: {
      name: 'The stolen sigil',
      text: 'You slip inside, the moon sigil cold against your palm. Its inscription calls you #property_title. Beneath it: “The crown is a prison. This is its key.” Beyond the inner door, something wakes.',
      carry: 'Carry the sigil to the throne',
    },
    haste: {
      name: 'The price of haste',
      text: 'You land inside, cloak torn, still alive. No ally. No relic. On the inner door, a carving names you #property_title. A warning follows: “Whoever defeats the crowned guardian takes its place.” The handle begins to turn.',
      face: 'Face what waits inside',
    },
    brought: { name: 'What you brought with you' },
    guardianLight: {
      name: 'The guardian and the light',
      text: 'On the throne sits a shadow wearing your face. It lunges. The spirit you saved flares between you. “I remember your true name,” it says. “Hold it back, or trust me to speak.” Dawn touches the windows.',
      speak: 'Let the spirit speak your true name',
      deed: 'The spirit speaks your true name. The shadow kneels; the crown cracks.',
    },
    guardianKey: {
      name: 'The guardian and the key',
      text: 'On the throne sits a shadow wearing your face. It lunges. The stolen sigil pulls toward a hollow in its crown. Your gift can defeat the guardian, but the key could end its curse. Dawn touches the windows.',
      fit: 'Fit the stolen sigil into the crown',
      deed: 'You dodge its grasp and turn the stolen sigil in the crown. The prison opens.',
    },
    guardianAlone: {
      name: 'The guardian alone',
      text: 'On the throne sits a shadow wearing your face. It lunges. You have only your gift, and the warning on the door: victory will bind you here. Behind you, a window opens onto the waking world.',
    },
    kindness: { name: 'A kindness returned' },
    promise: {
      name: 'The promise kept',
      text: '#property_deed The light you brought into this place keeps the crown from claiming you. You remember now: you were its first prisoner, and you promised to free the rest. At dawn, a thousand sleeping souls walk home beside you.',
    },
    nextGuardian: {
      name: 'The next guardian',
      text: '#property_deed The guardian falls. The crown settles on your brow. You remember now: this is how you lost your name the first time. Outside, dawn breaks. Inside, #property_title waits for the next footsteps.',
    },
    ownName: {
      name: 'A name of your own',
      text: 'You leap into the morning. Behind you, the crown screams a name you no longer need. Let the citadel remember #property_title. You choose the road, the living world, and a name you have yet to earn.',
    },
  },
}

// Each final encounter offers an action for every skill. The player only sees
// the skill chosen on arrival.
const skillAnswers = (copy: ExampleStoryCopy, nodeIndex: number): node_answer[] =>
  (['blade', 'shadow', 'ember'] as const).map((skill, index) => ({
    id: `answer_${nodeIndex}_${index}`,
    text: copy.skills[skill].answer,
    requirements: [{ target: `stat_${skill}`, type: 'stat', amount: 1 }],
    events: [{
      id: `event_${nodeIndex}_${skill}`, action: 'alterProperty', type: 'property',
      target: 'property_deed', amount: '', property: copy.skills[skill].deed,
    }],
    join: [{ node: 'node_11' }],
  }))

const retreatAnswer = (copy: ExampleStoryCopy, nodeIndex: number): node_answer => ({
  id: `answer_${nodeIndex}_4`,
  text: copy.retreat,
  join: [{ node: 'node_14' }],
})

const choosePath = (copy: ExampleStoryCopy, skill: Skill, index: number): node_answer => ({
  id: `answer_0_${index}`, text: copy.nodes.citadel[skill],
  events: [
    { id: `event_0_${skill}`, action: 'alterStat', type: 'stat', target: `stat_${skill}`, amount: '1' },
    { id: `event_0_${skill}_title`, action: 'alterProperty', type: 'property', target: 'property_title', amount: '', property: copy.titles[skill] },
  ],
  join: [{ node: `node_${index + 1}` }],
})

// Five visible scenes per playthrough; two invisible distributors remember
// earlier choices. All state belongs to the landing demo's local player.
export const buildExampleStory = (copy: ExampleStoryCopy) => {
  const { nodes } = copy
  return {
    refs: {
      stat_blade: { name: copy.refs.blade, type: 'stat' },
      stat_shadow: { name: copy.refs.shadow, type: 'stat' },
      stat_ember: { name: copy.refs.ember, type: 'stat' },
      condition_spirit: { name: copy.refs.spirit, type: 'condition' },
      condition_sigil: { name: copy.refs.sigil, type: 'condition' },
      property_title: { name: copy.refs.title, type: 'property' },
      property_deed: { name: copy.refs.deed, type: 'property' },
    },
    categories: [],
    nodes: [
      {
        id: 'node_0',
        name: nodes.citadel.name,
        type: 'content',
        top: 700,
        left: 0,
        text: nodes.citadel.text,
        answers: [
          choosePath(copy, 'blade', 0),
          choosePath(copy, 'shadow', 1),
          choosePath(copy, 'ember', 2),
        ],
      },
      {
        id: 'node_1',
        name: nodes.bridge.name,
        type: 'content',
        top: 0,
        left: 420,
        text: nodes.bridge.text,
        answers: [
          { id: 'answer_1_0', text: nodes.bridge.free, join: [{ node: 'node_4' }] },
          { id: 'answer_1_1', text: nodes.bridge.cut, join: [{ node: 'node_6' }] },
        ],
      },
      {
        id: 'node_2',
        name: nodes.stair.name,
        type: 'content',
        top: 700,
        left: 420,
        text: nodes.stair.text,
        answers: [
          { id: 'answer_2_0', text: nodes.stair.steal, join: [{ node: 'node_5' }] },
          { id: 'answer_2_1', text: nodes.stair.hide, join: [{ node: 'node_4' }] },
        ],
      },
      {
        id: 'node_3',
        name: nodes.gate.name,
        type: 'content',
        top: 1400,
        left: 420,
        text: nodes.gate.text,
        answers: [
          { id: 'answer_3_0', text: nodes.gate.tame, join: [{ node: 'node_5' }] },
          { id: 'answer_3_1', text: nodes.gate.walk, join: [{ node: 'node_6' }] },
        ],
      },
      {
        id: 'node_4',
        name: nodes.light.name,
        type: 'content',
        top: 0,
        left: 840,
        text: nodes.light.text,
        events: [{ id: 'event_4_spirit', action: 'alterCondition', type: 'condition', target: 'condition_spirit', amount: '1' }],
        answers: [{ id: 'answer_4_0', text: nodes.light.approach, join: [{ node: 'node_7' }] }],
      },
      {
        id: 'node_5',
        name: nodes.sigil.name,
        type: 'content',
        top: 700,
        left: 840,
        text: nodes.sigil.text,
        events: [{ id: 'event_5_sigil', action: 'alterCondition', type: 'condition', target: 'condition_sigil', amount: '1' }],
        answers: [{ id: 'answer_5_0', text: nodes.sigil.carry, join: [{ node: 'node_7' }] }],
      },
      {
        id: 'node_6',
        name: nodes.haste.name,
        type: 'content',
        top: 1400,
        left: 840,
        text: nodes.haste.text,
        answers: [{ id: 'answer_6_0', text: nodes.haste.face, join: [{ node: 'node_7' }] }],
      },
      {
        id: 'node_7',
        name: nodes.brought.name,
        type: 'distributor',
        top: 700,
        left: 1260,
        conditions: [
          { id: 'condition_7_0', ref: 'condition_spirit', comparator: 'equalto', value: 1, join: [{ node: 'node_8' }] },
          { id: 'condition_7_1', ref: 'condition_sigil', comparator: 'equalto', value: 1, join: [{ node: 'node_9' }] },
        ],
        fallbackCondition: { id: 'condition_7_fallback', join: [{ node: 'node_10' }] },
      },
      {
        id: 'node_8',
        name: nodes.guardianLight.name,
        type: 'content',
        top: 0,
        left: 1680,
        text: nodes.guardianLight.text,
        answers: [
          ...skillAnswers(copy, 8),
          {
            id: 'answer_8_3', text: nodes.guardianLight.speak,
            requirements: [{ target: 'condition_spirit', type: 'condition', amount: 1 }],
            events: [{ id: 'event_8_name', action: 'alterProperty', type: 'property', target: 'property_deed', amount: '', property: nodes.guardianLight.deed }],
            join: [{ node: 'node_12' }],
          },
          retreatAnswer(copy, 8),
        ],
      },
      {
        id: 'node_9',
        name: nodes.guardianKey.name,
        type: 'content',
        top: 700,
        left: 1680,
        text: nodes.guardianKey.text,
        answers: [
          ...skillAnswers(copy, 9),
          {
            id: 'answer_9_3', text: nodes.guardianKey.fit,
            requirements: [{ target: 'condition_sigil', type: 'condition', amount: 1 }],
            events: [{ id: 'event_9_key', action: 'alterProperty', type: 'property', target: 'property_deed', amount: '', property: nodes.guardianKey.deed }],
            join: [{ node: 'node_12' }],
          },
          retreatAnswer(copy, 9),
        ],
      },
      {
        id: 'node_10',
        name: nodes.guardianAlone.name,
        type: 'content',
        top: 1400,
        left: 1680,
        text: nodes.guardianAlone.text,
        answers: [...skillAnswers(copy, 10), retreatAnswer(copy, 10)],
      },
      {
        id: 'node_11',
        name: nodes.kindness.name,
        type: 'distributor',
        top: 0,
        left: 2100,
        conditions: [
          { id: 'condition_11_0', ref: 'condition_spirit', comparator: 'equalto', value: 1, join: [{ node: 'node_12' }] },
        ],
        fallbackCondition: { id: 'condition_11_fallback', join: [{ node: 'node_13' }] },
      },
      {
        id: 'node_12',
        name: nodes.promise.name,
        type: 'end',
        top: 0,
        left: 2520,
        text: nodes.promise.text,
      },
      {
        id: 'node_13',
        name: nodes.nextGuardian.name,
        type: 'end',
        top: 700,
        left: 2520,
        text: nodes.nextGuardian.text,
      },
      {
        id: 'node_14',
        name: nodes.ownName.name,
        type: 'end',
        top: 1400,
        left: 2520,
        text: nodes.ownName.text,
      },
    ],
  } satisfies tree
}

export const exampleStory = buildExampleStory(exampleStoryEn)

export const EXAMPLE_STORY_COPY: Record<Lang, ExampleStoryCopy> = {
  en: exampleStoryEn,
  es: exampleStoryEs,
  ca: exampleStoryCa,
}
