import type { StoryAnswer, StoryNode, StoryTree } from '@trama-app/engine'
import { buildExampleStory, EXAMPLE_STORY_COPY } from '@app/app/shared/example-story/exampleStory'
import type { Lang } from '../../i18n'

// The stories the hero offers to play, side by side. Each paints the hero with its
// own landscape. The example story new authors start with comes first and the dark
// lighthouse sits in the middle, but the page opens on the lighthouse: its coast is
// the hero's cover, the one made of words. The engine plays all of them the same way.

export const HERO_SCENES = ['valley', 'coast', 'desert'] as const
export type HeroScene = (typeof HERO_SCENES)[number]

/** The story the page opens on, already in the middle of the carousel. */
export const OPENING_STORY = 'lighthouse'

export interface HeroStory {
  id: string
  scene: HeroScene
  title: string
  tree: StoryTree
}

const content = (id: string, text: string, answers: StoryAnswer[]): StoryNode => ({ id, type: 'content', text: `<p>${text}</p>`, answers })
const ending = (id: string, text: string): StoryNode => ({ id, type: 'end', text: `<p>${text}</p>` })
const go = (id: string, text: string, node: string, events?: StoryAnswer['events']): StoryAnswer => ({ id, text, join: [{ node }], ...(events && { events }) })
const add = (target: string, amount: number): NonNullable<StoryAnswer['events']> => [{ action: 'alterStat', type: 'stat', target, amount: String(amount) }]
const mark = (target: string): NonNullable<StoryAnswer['events']> => [{ action: 'alterCondition', type: 'condition', target, amount: '1' }]

interface LighthouseCopy {
  title: string
  start: string
  run: string
  harbour: string
  port: string
  row: string
  together: string
  tower: string
  oil: string
  fire: string
  lamp: string
  light: string
  rowed: string
  burned: string
  lit: string
  companions: string
  oilRef: string
}

interface OasisCopy {
  title: string
  start: string
  stars: string
  steps: string
  well: string
  fill: string
  onwards: string
  tent: string
  map: string
  leave: string
  tower: string
  palms: string
  lost: string
  water: string
  mapRef: string
}

const LIGHTHOUSE: Record<Lang, LighthouseCopy> = {
  en: {
    title: 'The dark lighthouse',
    start: 'Night falls on the coast and the lighthouse stays dark. Far off, the lights of a ship are drifting towards the rocks.',
    run: 'Run to the lighthouse',
    harbour: 'Go down to the harbour for help',
    port: 'At the harbour, an old fisherwoman hears you out. She unties her boat without a word.',
    row: 'Row out to the ship',
    together: 'Climb the lighthouse with her',
    tower: 'The lighthouse door is open. At the top, the lamp is cold and its tank is empty.',
    oil: 'Look for oil in the storeroom',
    fire: 'Light a fire on the gallery',
    lamp: 'With the oil in your hands, you climb the hundred steps to the lamp.',
    light: 'Light the lamp',
    rowed: 'You reach the ship with burning arms. They hear you and turn in time. No one will ever know who you were.',
    burned: 'The fire burns too low. The ship scrapes past the rocks, but it gets past.',
    lit: 'The light sweeps the water again. On the ship, someone waves to you.',
    companions: 'companions',
    oilRef: 'oil',
  },
  es: {
    title: 'El faro apagado',
    start: 'La noche cae sobre la costa y el faro no se enciende. A lo lejos, las luces de un barco se acercan a las rocas.',
    run: 'Corre hacia el faro',
    harbour: 'Baja al puerto a pedir ayuda',
    port: 'En el puerto, una pescadora vieja te escucha. Suelta la barca sin decir nada.',
    row: 'Rema hacia el barco',
    together: 'Sube al faro con ella',
    tower: 'La puerta del faro está abierta. Arriba, la lámpara está fría y el depósito, vacío.',
    oil: 'Busca aceite en el almacén',
    fire: 'Enciende una hoguera en el balcón',
    lamp: 'Con el aceite en las manos, subes los cien escalones hasta la lámpara.',
    light: 'Enciende la luz',
    rowed: 'Llegas al barco con los brazos ardiendo. Te escuchan y viran a tiempo. Nadie sabrá nunca quién eras.',
    burned: 'La hoguera arde demasiado poco. El barco pasa rozando las rocas, pero pasa.',
    lit: 'La luz vuelve a girar sobre el agua. Desde el barco, alguien te saluda.',
    companions: 'compañía',
    oilRef: 'aceite',
  },
  ca: {
    title: 'El far apagat',
    start: 'La nit cau sobre la costa i el far no s’encén. Al lluny, les llums d’un vaixell s’acosten a les roques.',
    run: 'Corre cap al far',
    harbour: 'Baixa al port a demanar ajuda',
    port: 'Al port, una pescadora vella t’escolta. Deixa anar la barca sense dir res.',
    row: 'Rema cap al vaixell',
    together: 'Puja al far amb ella',
    tower: 'La porta del far és oberta. A dalt, la llàntia és freda i el dipòsit, buit.',
    oil: 'Busca oli al magatzem',
    fire: 'Encén una foguera a la balconada',
    lamp: 'Amb l’oli a les mans, puges els cent graons fins a la llàntia.',
    light: 'Encén la llum',
    rowed: 'Arribes al vaixell amb els braços cremats. T’escolten i viren a temps. Ningú no sabrà mai qui eres.',
    burned: 'La foguera crema massa poc. El vaixell passa a tocar de les roques, però passa.',
    lit: 'La llum torna a girar sobre l’aigua. Des del vaixell, algú et saluda.',
    companions: 'companyia',
    oilRef: 'oli',
  },
}

const OASIS: Record<Lang, OasisCopy> = {
  en: {
    title: 'The oasis',
    start: 'Three days ago the storm cut you off from the caravan. You have half a flask of water and two ways: the stars, or footprints in the sand.',
    stars: 'Follow the stars',
    steps: 'Follow the footprints',
    well: 'At night the cold wakes you beside a well half buried in sand.',
    fill: 'Fill your flask',
    onwards: 'Keep going without stopping',
    tent: 'The footprints lead to a torn tent. Inside is a map with a tower marked on it.',
    map: 'Take the map',
    leave: 'Leave everything as it was',
    tower: 'The map does not lie: the tower hides the oasis, and the caravan is waiting there.',
    palms: 'With the water from the well you last until dawn. On the horizon, palm trees.',
    lost: 'The sand swallows everything. When they find you, you cannot remember how you got there.',
    water: 'water',
    mapRef: 'map',
  },
  es: {
    title: 'El oasis',
    start: 'Hace tres días que la tormenta te separó de la caravana. Te queda media cantimplora y dos caminos: las estrellas o unas huellas en la arena.',
    stars: 'Sigue las estrellas',
    steps: 'Sigue las huellas',
    well: 'De noche, el frío te despierta junto a un pozo medio enterrado en la arena.',
    fill: 'Llena la cantimplora',
    onwards: 'Sigue sin detenerte',
    tent: 'Las huellas llevan a una tienda rasgada. Dentro hay un mapa con una torre marcada.',
    map: 'Coge el mapa',
    leave: 'Déjalo todo como estaba',
    tower: 'El mapa no miente: la torre esconde el oasis, y la caravana te espera allí.',
    palms: 'Con el agua del pozo aguantas hasta el alba. En el horizonte, unas palmeras.',
    lost: 'La arena se lo traga todo. Cuando te encuentran, no recuerdas cómo llegaste.',
    water: 'agua',
    mapRef: 'mapa',
  },
  ca: {
    title: 'L’oasi',
    start: 'Fa tres dies que la tempesta et va separar de la caravana. Et queda mitja cantimplora i dos camins: les estrelles o unes petjades a la sorra.',
    stars: 'Segueix les estrelles',
    steps: 'Segueix les petjades',
    well: 'De nit, el fred et desperta al costat d’un pou mig colgat per la sorra.',
    fill: 'Omple la cantimplora',
    onwards: 'Continua sense aturar-te',
    tent: 'Les petjades porten a una tenda esquinçada. A dins hi ha un mapa amb una torre marcada.',
    map: 'Agafa el mapa',
    leave: 'Deixa-ho tot com estava',
    tower: 'El mapa no menteix: la torre amaga l’oasi, i la caravana t’hi espera.',
    palms: 'Amb l’aigua del pou aguantes fins a l’alba. A l’horitzó, unes palmeres.',
    lost: 'La sorra s’ho empassa tot. Quan et troben, no recordes com hi has arribat.',
    water: 'aigua',
    mapRef: 'mapa',
  },
}

/** Two ways to warn a ship, and a lighthouse that remembers who came along. */
function lighthouse(lang: Lang): StoryTree {
  const l = LIGHTHOUSE[lang]
  return {
    nodes: [
      content('start', l.start, [go('run', l.run, 'tower'), go('harbour', l.harbour, 'port')]),
      content('port', l.port, [go('row', l.row, 'rowed'), go('together', l.together, 'tower', add('stat_companions', 1))]),
      content('tower', l.tower, [go('oil', l.oil, 'lamp', mark('condition_oil')), go('fire', l.fire, 'burned')]),
      content('lamp', l.lamp, [go('light', l.light, 'lit')]),
      ending('rowed', l.rowed),
      ending('burned', l.burned),
      ending('lit', l.lit),
    ],
    refs: {
      stat_companions: { name: l.companions, type: 'stat' },
      condition_oil: { name: l.oilRef, type: 'condition' },
    },
    categories: [],
    entryPoint: { targetNodeId: 'start' },
  } as StoryTree
}

/** Lost in the desert: what you picked up on the way decides where you arrive. */
function oasis(lang: Lang): StoryTree {
  const o = OASIS[lang]
  return {
    nodes: [
      content('start', o.start, [go('stars', o.stars, 'well'), go('steps', o.steps, 'tent')]),
      content('well', o.well, [go('fill', o.fill, 'route', add('stat_water', 2)), go('onwards', o.onwards, 'route')]),
      content('tent', o.tent, [go('map', o.map, 'route', mark('condition_map')), go('leave', o.leave, 'route')]),
      {
        id: 'route',
        type: 'distributor',
        conditions: [
          { id: 'with_map', rules: [{ ref: 'condition_map', comparator: 'equalto', value: 1 }], join: [{ node: 'tower' }] },
          { id: 'with_water', rules: [{ ref: 'stat_water', comparator: 'morethan', value: 0 }], join: [{ node: 'palms' }] },
        ],
        fallbackCondition: { join: [{ node: 'lost' }] },
      },
      ending('tower', o.tower),
      ending('palms', o.palms),
      ending('lost', o.lost),
    ],
    refs: {
      stat_water: { name: o.water, type: 'stat' },
      condition_map: { name: o.mapRef, type: 'condition' },
    },
    categories: [],
    entryPoint: { targetNodeId: 'start' },
  } as StoryTree
}

/** The hero's stories in order: the example story first, the dark lighthouse in the middle. */
export function heroStories(lang: Lang): HeroStory[] {
  const example = EXAMPLE_STORY_COPY[lang]
  return [
    { id: 'threshold', scene: 'valley', title: example.title, tree: buildExampleStory(example) as StoryTree },
    { id: 'lighthouse', scene: 'coast', title: LIGHTHOUSE[lang].title, tree: lighthouse(lang) },
    { id: 'oasis', scene: 'desert', title: OASIS[lang].title, tree: oasis(lang) },
  ]
}
