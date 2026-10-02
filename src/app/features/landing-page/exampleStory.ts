import { node_answer, tree } from 'src/app/core/interfaces/interfaces'

// Each final encounter offers an action for every skill. The player only sees
// the skill chosen on arrival.
const skillAnswers = (nodeIndex: number): node_answer[] => [
  {
    id: `answer_${nodeIndex}_0`,
    text: 'Sever its shadow with your blade',
    requirements: [{ target: 'stat_blade', type: 'stat', amount: 1 }],
    events: [{
      id: `event_${nodeIndex}_blade`, action: 'alterProperty', type: 'property',
      target: 'property_deed', amount: '', property: 'Your blade severs the shadow binding the throne.',
    }],
    join: [{ node: 'node_11' }],
  },
  {
    id: `answer_${nodeIndex}_1`,
    text: 'Slip into its shadow and strike',
    requirements: [{ target: 'stat_shadow', type: 'stat', amount: 1 }],
    events: [{
      id: `event_${nodeIndex}_shadow`, action: 'alterProperty', type: 'property',
      target: 'property_deed', amount: '', property: 'You slip through its shadow and shatter the darkness from within.',
    }],
    join: [{ node: 'node_11' }],
  },
  {
    id: `answer_${nodeIndex}_2`,
    text: 'Burn the darkness with your last ember',
    requirements: [{ target: 'stat_ember', type: 'stat', amount: 1 }],
    events: [{
      id: `event_${nodeIndex}_ember`, action: 'alterProperty', type: 'property',
      target: 'property_deed', amount: '', property: 'Your last ember burns the darkness out of the crown.',
    }],
    join: [{ node: 'node_11' }],
  },
]

const retreatAnswer = (nodeIndex: number): node_answer => ({
  id: `answer_${nodeIndex}_4`,
  text: 'Leave the crown. Choose the dawn.',
  join: [{ node: 'node_14' }],
})

// Five visible scenes per playthrough; two invisible distributors remember
// earlier choices. All state belongs to the landing demo's local player.
export const exampleStory = {
  refs: {
    stat_blade: { name: 'Blade', type: 'stat' },
    stat_shadow: { name: 'Shadow', type: 'stat' },
    stat_ember: { name: 'Ember', type: 'stat' },
    condition_spirit: { name: 'Freed lantern-spirit', type: 'condition' },
    condition_sigil: { name: 'Stolen moon sigil', type: 'condition' },
    property_title: { name: 'Forgotten title', type: 'property' },
    property_deed: { name: 'Final deed', type: 'property' },
  },
  categories: [],
  nodes: [
    {
      id: 'node_0',
      name: 'At last, the citadel',
      type: 'content',
      top: 700,
      left: 0,
      text: 'After years following a voice in your dreams, you reach the Hollow Citadel. Beneath your hood, an old scar burns. You remember no name, only a promise: reach the crown before dawn. Three ways in. One gift you still trust.',
      answers: [
        {
          id: 'answer_0_0', text: 'Blade — cross the bridge of sentries',
          events: [
            { id: 'event_0_blade', action: 'alterStat', type: 'stat', target: 'stat_blade', amount: '1' },
            { id: 'event_0_blade_title', action: 'alterProperty', type: 'property', target: 'property_title', amount: '', property: 'the Last Blade' },
          ],
          join: [{ node: 'node_1' }],
        },
        {
          id: 'answer_0_1', text: 'Shadow — climb the haunted stair',
          events: [
            { id: 'event_0_shadow', action: 'alterStat', type: 'stat', target: 'stat_shadow', amount: '1' },
            { id: 'event_0_shadow_title', action: 'alterProperty', type: 'property', target: 'property_title', amount: '', property: 'the Unseen' },
          ],
          join: [{ node: 'node_2' }],
        },
        {
          id: 'answer_0_2', text: 'Ember — enter the gate of living fire',
          events: [
            { id: 'event_0_ember', action: 'alterStat', type: 'stat', target: 'stat_ember', amount: '1' },
            { id: 'event_0_ember_title', action: 'alterProperty', type: 'property', target: 'property_title', amount: '', property: 'the Ember Keeper' },
          ],
          join: [{ node: 'node_3' }],
        },
      ],
    },
    {
      id: 'node_1',
      name: 'The bridge of sentries',
      type: 'content',
      top: 0,
      left: 420,
      text: 'Stone sentries raise their swords. Behind them, a lantern-spirit hangs in chains. Your blade finds the weak point: one stroke can free it, or drop the bridge and its guardians into the abyss.',
      answers: [
        { id: 'answer_1_0', text: 'Fight through. Cut the spirit free.', join: [{ node: 'node_4' }] },
        { id: 'answer_1_1', text: 'Cut the bridge loose. Leap alone.', join: [{ node: 'node_6' }] },
      ],
    },
    {
      id: 'node_2',
      name: 'The haunted stair',
      type: 'content',
      top: 700,
      left: 420,
      text: 'Hungry ghosts sweep the stair. You slip between their shadows, unseen. A moon sigil glints in their keeper’s hand; beside it, a trapped lantern-spirit flickers. You can take one before they turn.',
      answers: [
        { id: 'answer_2_0', text: 'Steal the moon sigil', join: [{ node: 'node_5' }] },
        { id: 'answer_2_1', text: 'Hide the spirit in your shadow', join: [{ node: 'node_4' }] },
      ],
    },
    {
      id: 'node_3',
      name: 'The gate of living fire',
      type: 'content',
      top: 1400,
      left: 420,
      text: 'The gate breathes fire. A moon sigil holds its jaws apart. The ember in your palm can quiet the flames long enough to take it, or turn their fury into a path straight through.',
      answers: [
        { id: 'answer_3_0', text: 'Tame the fire. Take the sigil.', join: [{ node: 'node_5' }] },
        { id: 'answer_3_1', text: 'Walk through the blaze', join: [{ node: 'node_6' }] },
      ],
    },
    {
      id: 'node_4',
      name: 'A light remembers',
      type: 'content',
      top: 0,
      left: 840,
      text: 'You clear the danger with a small light beside you. “They called you #property_title,” the spirit whispers. “You came here once to break the crown. This time, let me help.” Beyond the inner door, something wakes.',
      events: [{ id: 'event_4_spirit', action: 'alterCondition', type: 'condition', target: 'condition_spirit', amount: '1' }],
      answers: [{ id: 'answer_4_0', text: 'Approach the throne together', join: [{ node: 'node_7' }] }],
    },
    {
      id: 'node_5',
      name: 'The stolen sigil',
      type: 'content',
      top: 700,
      left: 840,
      text: 'You slip inside, the moon sigil cold against your palm. Its inscription calls you #property_title. Beneath it: “The crown is a prison. This is its key.” Beyond the inner door, something wakes.',
      events: [{ id: 'event_5_sigil', action: 'alterCondition', type: 'condition', target: 'condition_sigil', amount: '1' }],
      answers: [{ id: 'answer_5_0', text: 'Carry the sigil to the throne', join: [{ node: 'node_7' }] }],
    },
    {
      id: 'node_6',
      name: 'The price of haste',
      type: 'content',
      top: 1400,
      left: 840,
      text: 'You land inside, cloak torn, still alive. No ally. No relic. On the inner door, a carving names you #property_title. A warning follows: “Whoever defeats the crowned guardian takes its place.” The handle begins to turn.',
      answers: [{ id: 'answer_6_0', text: 'Face what waits inside', join: [{ node: 'node_7' }] }],
    },
    {
      id: 'node_7',
      name: 'What you brought with you',
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
      name: 'The guardian and the light',
      type: 'content',
      top: 0,
      left: 1680,
      text: 'On the throne sits a shadow wearing your face. It lunges. The spirit you saved flares between you. “I remember your true name,” it says. “Hold it back, or trust me to speak.” Dawn touches the windows.',
      answers: [
        ...skillAnswers(8),
        {
          id: 'answer_8_3', text: 'Let the spirit speak your true name',
          requirements: [{ target: 'condition_spirit', type: 'condition', amount: 1 }],
          events: [{ id: 'event_8_name', action: 'alterProperty', type: 'property', target: 'property_deed', amount: '', property: 'The spirit speaks your true name. The shadow kneels; the crown cracks.' }],
          join: [{ node: 'node_12' }],
        },
        retreatAnswer(8),
      ],
    },
    {
      id: 'node_9',
      name: 'The guardian and the key',
      type: 'content',
      top: 700,
      left: 1680,
      text: 'On the throne sits a shadow wearing your face. It lunges. The stolen sigil pulls toward a hollow in its crown. Your gift can defeat the guardian, but the key could end its curse. Dawn touches the windows.',
      answers: [
        ...skillAnswers(9),
        {
          id: 'answer_9_3', text: 'Fit the stolen sigil into the crown',
          requirements: [{ target: 'condition_sigil', type: 'condition', amount: 1 }],
          events: [{ id: 'event_9_key', action: 'alterProperty', type: 'property', target: 'property_deed', amount: '', property: 'You dodge its grasp and turn the stolen sigil in the crown. The prison opens.' }],
          join: [{ node: 'node_12' }],
        },
        retreatAnswer(9),
      ],
    },
    {
      id: 'node_10',
      name: 'The guardian alone',
      type: 'content',
      top: 1400,
      left: 1680,
      text: 'On the throne sits a shadow wearing your face. It lunges. You have only your gift, and the warning on the door: victory will bind you here. Behind you, a window opens onto the waking world.',
      answers: [...skillAnswers(10), retreatAnswer(10)],
    },
    {
      id: 'node_11',
      name: 'A kindness returned',
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
      name: 'The promise kept',
      type: 'end',
      top: 0,
      left: 2520,
      text: '#property_deed The light you brought into this place keeps the crown from claiming you. You remember now: you were its first prisoner, and you promised to free the rest. At dawn, a thousand sleeping souls walk home beside you.',
    },
    {
      id: 'node_13',
      name: 'The next guardian',
      type: 'end',
      top: 700,
      left: 2520,
      text: '#property_deed The guardian falls. The crown settles on your brow. You remember now: this is how you lost your name the first time. Outside, dawn breaks. Inside, #property_title waits for the next footsteps.',
    },
    {
      id: 'node_14',
      name: 'A name of your own',
      type: 'end',
      top: 1400,
      left: 2520,
      text: 'You leap into the morning. Behind you, the crown screams a name you no longer need. Let the citadel remember #property_title. You choose the road, the living world, and a name you have yet to earn.',
    },
  ],
} satisfies tree
