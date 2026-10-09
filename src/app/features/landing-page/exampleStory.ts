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
      deed: 'Your blade cuts through the guardian’s shadow.',
    },
    shadow: {
      answer: 'Slip into its shadow and strike',
      deed: 'You slip into the guardian’s shadow and strike from within.',
    },
    ember: {
      answer: 'Burn the darkness with your last ember',
      deed: 'Your last ember burns through the guardian’s shadow.',
    },
  },
  retreat: 'Leave the crown. Choose the dawn.',
  nodes: {
    citadel: {
      name: 'At last, the citadel',
      text: '<p>“You promised to come back.” The voice in your dreams leads you to the <strong>Hollow Citadel</strong>, where a crown imprisons stolen souls.</p><p>You escaped once, but lost your memory. <em>Free the others before dawn seals the gates for a year.</em> Which gift will get you inside?</p>',
      blade: '<strong>Blade</strong> — cross the bridge of sentries',
      shadow: '<strong>Shadow</strong> — climb the haunted stair',
      ember: '<strong>Ember</strong> — enter the gate of living fire',
    },
    bridge: {
      name: 'The bridge of sentries',
      text: '<p>Stone sentries block the bridge. A chained <strong>lantern-spirit</strong> calls for help behind them.</p><p>You can fight through to free it, or cut the bridge’s chains and leap to the far side as the sentries fall.</p>',
      free: 'Fight through. Cut the spirit free.',
      cut: 'Cut the bridge loose. Leap alone.',
    },
    stair: {
      name: 'The haunted stair',
      text: '<p>You climb unseen among sleeping ghosts. Their keeper holds a <strong>moon sigil</strong>; a caged lantern-spirit glows beside it.</p><p>One ghost stirs. You have time to take the key or free the captive.</p>',
      steal: 'Steal the moon sigil',
      hide: 'Hide the spirit in your shadow',
    },
    gate: {
      name: 'The gate of living fire',
      text: '<p>A <strong>moon sigil</strong> feeds the fire across the gate. Your ember can quiet the flames while you remove it, or shield you as you rush through.</p><p>Taking the sigil costs precious time.</p>',
      tame: 'Tame the fire. Take the sigil.',
      walk: 'Walk through the blaze',
    },
    brought: { name: 'What you brought with you' },
    guardianLight: {
      name: 'The guardian and the light',
      text: '<p>Your own shadow guards the throne: the part of you the crown kept when you escaped.</p><p>“They called you <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>,” whispers the spirit. “Your true name can break the crown. Fight to give me time, or trust me to speak now.”</p><p><em>The shadow lunges. Dawn is near.</em> A door behind you leads outside.</p>',
      speak: 'Let the spirit speak your true name',
      deed: 'You lower your guard. The spirit steps between you and your shadow.',
    },
    guardianKey: {
      name: 'The guardian and the key',
      text: '<p>Your own shadow guards the throne: the part of you the crown kept when you escaped.</p><p>The sigil reads <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>. It fits a hollow in the crown: <em>a key to the prison</em>.</p><p>Destroy the guardian and take its place, or use the key to free everyone. A door behind you leads outside.</p>',
      fit: 'Fit the stolen sigil into the crown',
      deed: 'You dodge its grasp and turn the sigil in the crown. Your true name rings out.',
    },
    guardianAlone: {
      name: 'The guardian alone',
      text: '<p>Your own shadow guards the throne: the part of you the crown kept when you escaped.</p><p>“Welcome back, <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>.” It points to the crown. “Destroy me, and you take my place.”</p><p>You brought no key and no ally. <em>Fight, or leave through the door behind you before dawn.</em></p>',
    },
    kindness: { name: 'A kindness returned' },
    promise: {
      name: 'The promise kept',
      text: '<p><span data-trama-variable="" data-kind="property" data-key="property_deed">#property_deed</span></p><p>Your name rings out, breaking the spell. <strong>The crown crumbles</strong>; your shadow rejoins you, and your memories return.</p><p>You remember every face among the freed souls. This time, <em>you all leave together</em>.</p>',
    },
    nextGuardian: {
      name: 'The next guardian',
      text: '<p><span data-trama-variable="" data-kind="property" data-key="property_deed">#property_deed</span> The guardian falls. <strong>The crown settles on your brow.</strong></p><p>The gates close with the dawn. You won the fight, but the souls remain imprisoned. Now <span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span> guards them.</p>',
    },
    ownName: {
      name: 'A name of your own',
      text: '<p>You step outside as the gates close. The souls remain behind; <em>your promise must wait</em>.</p><p>Let the citadel remember <span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span>. You are free, with a year to find a way back.</p>',
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

// Four visible scenes per playthrough; two invisible distributors remember
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
    entryPoint: { left: -180, top: 600, targetNodeId: 'node_0' },
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
          {
            id: 'answer_1_0', text: nodes.bridge.free,
            events: [{ id: 'event_1_spirit', action: 'alterCondition', type: 'condition', target: 'condition_spirit', amount: '1' }],
            join: [{ node: 'node_7' }],
          },
          { id: 'answer_1_1', text: nodes.bridge.cut, join: [{ node: 'node_7' }] },
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
          {
            id: 'answer_2_0', text: nodes.stair.steal,
            events: [{ id: 'event_2_sigil', action: 'alterCondition', type: 'condition', target: 'condition_sigil', amount: '1' }],
            join: [{ node: 'node_7' }],
          },
          {
            id: 'answer_2_1', text: nodes.stair.hide,
            events: [{ id: 'event_2_spirit', action: 'alterCondition', type: 'condition', target: 'condition_spirit', amount: '1' }],
            join: [{ node: 'node_7' }],
          },
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
          {
            id: 'answer_3_0', text: nodes.gate.tame,
            events: [{ id: 'event_3_sigil', action: 'alterCondition', type: 'condition', target: 'condition_sigil', amount: '1' }],
            join: [{ node: 'node_7' }],
          },
          { id: 'answer_3_1', text: nodes.gate.walk, join: [{ node: 'node_7' }] },
        ],
      },
      {
        id: 'node_7',
        name: nodes.brought.name,
        type: 'distributor',
        top: 700,
        left: 840,
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
        left: 1260,
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
        left: 1260,
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
        left: 1260,
        text: nodes.guardianAlone.text,
        answers: [...skillAnswers(copy, 10), retreatAnswer(copy, 10)],
      },
      {
        id: 'node_11',
        name: nodes.kindness.name,
        type: 'distributor',
        top: 0,
        left: 1680,
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
        left: 2100,
        text: nodes.promise.text,
      },
      {
        id: 'node_13',
        name: nodes.nextGuardian.name,
        type: 'end',
        top: 700,
        left: 2100,
        text: nodes.nextGuardian.text,
      },
      {
        id: 'node_14',
        name: nodes.ownName.name,
        type: 'end',
        top: 1400,
        left: 2100,
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
