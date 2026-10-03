import type { ExampleStoryCopy } from './exampleStory'

export const exampleStoryCa: ExampleStoryCopy = {
  title: 'El darrer llindar',
  refs: {
    blade: 'Espasa',
    shadow: 'Ombra',
    ember: 'Brasa',
    spirit: 'Esperit del fanal alliberat',
    sigil: 'Segell lunar robat',
    title: 'Títol oblidat',
    deed: 'Gesta final',
  },
  titles: {
    blade: 'la Darrera Espasa',
    shadow: 'l’Ombra sense Rostre',
    ember: 'la Brasa Eterna',
  },
  skills: {
    blade: {
      answer: 'Talla la seva ombra amb l’espasa',
      deed: 'La teva espasa travessa l’ombra del guardià.',
    },
    shadow: {
      answer: 'Esmuny-te dins la seva ombra i ataca',
      deed: 'T’esmunys dins l’ombra del guardià i ataques des de dins.',
    },
    ember: {
      answer: 'Crema la foscor amb la teva darrera brasa',
      deed: 'La teva darrera brasa crema l’ombra del guardià.',
    },
  },
  retreat: 'Deixa la corona. Tria l’alba.',
  nodes: {
    citadel: {
      name: 'Per fi, la ciutadella',
      text: '<p>«Vas prometre tornar». La veu dels teus somnis et guia fins a la <strong>Ciutadella Buida</strong>, on una corona empresona ànimes robades.</p><p>En vas fugir, però vas perdre la memòria. <em>Allibera la resta abans que l’alba segelli les portes durant un any.</em> Amb quin do hi entraràs?</p>',
      blade: '<strong>Espasa</strong> — creua el pont dels sentinelles',
      shadow: '<strong>Ombra</strong> — puja l’escala embruixada',
      ember: '<strong>Brasa</strong> — entra per la porta de foc viu',
    },
    bridge: {
      name: 'El pont dels sentinelles',
      text: '<p>Els sentinelles de pedra barren el pont. Darrere seu, un <strong>esperit del fanal</strong> encadenat demana ajuda.</p><p>Pots obrir-te pas per alliberar-lo, o tallar les cadenes del pont i saltar a l’altra banda mentre els sentinelles cauen.</p>',
      free: 'Obre’t pas lluitant. Allibera l’esperit.',
      cut: 'Talla el pont. Salta en solitari.',
    },
    stair: {
      name: 'L’escala embruixada',
      text: '<p>Puges sense ser vist entre fantasmes adormits. El vigilant duu un <strong>segell lunar</strong>; al costat, un esperit del fanal brilla dins una gàbia.</p><p>Un fantasma es belluga. Tens temps de prendre la clau o alliberar el captiu.</p>',
      steal: 'Roba el segell lunar',
      hide: 'Amaga l’esperit dins la teva ombra',
    },
    gate: {
      name: 'La porta de foc viu',
      text: '<p>Un <strong>segell lunar</strong> alimenta el foc de la porta. La teva brasa pot calmar les flames mentre el retires, o protegir-te si les travesses de pressa.</p><p>Prendre el segell et costarà un temps preciós.</p>',
      tame: 'Doma el foc. Pren el segell.',
      walk: 'Travessa les flames',
    },
    brought: { name: 'El que portes amb tu' },
    guardianLight: {
      name: 'El guardià i la llum',
      text: '<p>La teva pròpia ombra custodia el tron: la part de tu que la corona va retenir quan vas fugir.</p><p>«Et deien <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>», xiuxiueja l’esperit. «El teu nom veritable pot trencar la corona. Lluita per donar-me temps, o deixa’m dir-lo ara».</p><p><em>L’ombra es llança sobre tu. L’alba s’acosta.</em> Darrere teu hi ha una porta de sortida.</p>',
      speak: 'Deixa que l’esperit pronunciï el teu veritable nom',
      deed: 'Abaixes la guàrdia. L’esperit s’interposa entre tu i la teva ombra.',
    },
    guardianKey: {
      name: 'El guardià i la clau',
      text: '<p>La teva pròpia ombra custodia el tron: la part de tu que la corona va retenir quan vas fugir.</p><p>El segell diu <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>. Encaixa en un buit de la corona: <em>és la clau de la presó</em>.</p><p>Destrueix el guardià i ocupa el seu lloc, o fes servir la clau per alliberar tothom. Una porta darrere teu duu a fora.</p>',
      fit: 'Encaixa el segell robat a la corona',
      deed: 'Esquives la seva urpa i gires el segell dins la corona. Ressona el teu nom veritable.',
    },
    guardianAlone: {
      name: 'El guardià, sol',
      text: '<p>La teva pròpia ombra custodia el tron: la part de tu que la corona va retenir quan vas fugir.</p><p>«Has tornat, <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>». Assenyala la corona. «Si em destrueixes, ocuparàs el meu lloc».</p><p>No dus cap clau ni cap aliat. <em>Lluita, o surt per la porta darrere teu abans de l’alba.</em></p>',
    },
    kindness: { name: 'Un favor retornat' },
    promise: {
      name: 'La promesa complerta',
      text: '<p><span data-trama-variable="" data-kind="property" data-key="property_deed">#property_deed</span></p><p>El teu nom ressona i desfà l’encanteri. <strong>La corona s’esmicola</strong>; l’ombra torna a tu, i recuperes els records.</p><p>Reconeixes cada rostre entre les ànimes alliberades. Aquest cop, <em>sortiu plegats</em>.</p>',
    },
    nextGuardian: {
      name: 'El següent guardià',
      text: '<p><span data-trama-variable="" data-kind="property" data-key="property_deed">#property_deed</span> El guardià cau. <strong>La corona se’t posa al front.</strong></p><p>Les portes es tanquen amb l’alba. Has guanyat la lluita, però les ànimes continuen presoneres. Ara les custodia <span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span>.</p>',
    },
    ownName: {
      name: 'Un nom propi',
      text: '<p>Surts mentre les portes es tanquen. Les ànimes queden a dins; <em>la teva promesa haurà d’esperar</em>.</p><p>Que la ciutadella recordi <span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span>. Ets lliure, i tens un any per trobar la manera de tornar-hi.</p>',
    },
  },
}
