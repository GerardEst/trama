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
      deed: 'La teva espasa talla l’ombra que lliga el tron.',
    },
    shadow: {
      answer: 'Esmuny-te dins la seva ombra i ataca',
      deed: 'T’esmunys per la seva ombra i trenques la foscor des de dins.',
    },
    ember: {
      answer: 'Crema la foscor amb la teva darrera brasa',
      deed: 'La teva darrera brasa crema la foscor de la corona.',
    },
  },
  retreat: 'Deixa la corona. Tria l’alba.',
  nodes: {
    citadel: {
      name: 'Per fi, la ciutadella',
      text: 'Després d’anys seguint una veu en somnis, arribes a la Ciutadella Buida. Sota la caputxa, et crema una cicatriu antiga. No recordes cap nom, només una promesa: arribar a la corona abans de l’alba. Tres entrades. Un do en què encara confies.',
      blade: 'Espasa — creua el pont dels sentinelles',
      shadow: 'Ombra — puja l’escala embruixada',
      ember: 'Brasa — entra per la porta de foc viu',
    },
    bridge: {
      name: 'El pont dels sentinelles',
      text: 'Els sentinelles de pedra alcen les espases. Darrere seu, un esperit del fanal penja encadenat. La teva espasa troba el punt feble: un sol cop pot alliberar-lo, o fer caure el pont i els seus guardians a l’abisme.',
      free: 'Obre’t pas lluitant. Allibera l’esperit.',
      cut: 'Talla el pont. Salta en solitari.',
    },
    stair: {
      name: 'L’escala embruixada',
      text: 'Fantasmes famolencs escombren l’escala. T’esmunys entre les seves ombres sense que ningú et vegi. Un segell lunar brilla a la mà del seu guardià; al costat, parpelleja un esperit del fanal atrapat. Pots agafar-ne un abans que es girin.',
      steal: 'Roba el segell lunar',
      hide: 'Amaga l’esperit dins la teva ombra',
    },
    gate: {
      name: 'La porta de foc viu',
      text: 'La porta respira foc. Un segell lunar en manté obertes les mandíbules. La brasa del teu palmell pot calmar les flames el temps just per agafar-lo, o convertir-ne la fúria en un camí que la travessi.',
      tame: 'Doma el foc. Pren el segell.',
      walk: 'Travessa les flames',
    },
    light: {
      name: 'Una llum recorda',
      text: 'Superes el perill amb una petita llum al costat. «Et deien #property_title», xiuxiueja l’esperit. «Ja vas venir una vegada a trencar la corona. Aquest cop, deixa’m ajudar-te». Rere la porta interior, alguna cosa es desperta.',
      approach: 'Acosteu-vos junts al tron',
    },
    sigil: {
      name: 'El segell robat',
      text: 'T’esmunys a dins, amb el segell lunar fred al palmell. La inscripció et diu #property_title. A sota: «La corona és una presó. Aquesta n’és la clau». Rere la porta interior, alguna cosa es desperta.',
      carry: 'Porta el segell fins al tron',
    },
    haste: {
      name: 'El preu de la pressa',
      text: 'Caus a dins amb la capa estripada, però encara amb vida. Sense aliats. Sense relíquies. A la porta interior, una talla et nomena #property_title. La segueix un avís: «Qui derroti el guardià coronat n’ocuparà el lloc». El pom comença a girar.',
      face: 'Afronta el que t’espera a dins',
    },
    brought: { name: 'El que portes amb tu' },
    guardianLight: {
      name: 'El guardià i la llum',
      text: 'Al tron hi seu una ombra amb el teu rostre. Se’t llança a sobre. L’esperit que vas salvar esclata en llum entre tots dos. «Recordo el teu veritable nom», diu. «Atura-la, o confia en mi i deixa’m parlar». L’alba toca les finestres.',
      speak: 'Deixa que l’esperit pronunciï el teu veritable nom',
      deed: 'L’esperit pronuncia el teu veritable nom. L’ombra s’agenolla; la corona s’esquerda.',
    },
    guardianKey: {
      name: 'El guardià i la clau',
      text: 'Al tron hi seu una ombra amb el teu rostre. Se’t llança a sobre. El segell robat estira cap a un buit de la seva corona. El teu do pot derrotar el guardià, però la clau en podria trencar la maledicció. L’alba toca les finestres.',
      fit: 'Encaixa el segell robat a la corona',
      deed: 'Esquives la seva urpa i gires el segell robat dins la corona. La presó s’obre.',
    },
    guardianAlone: {
      name: 'El guardià, sol',
      text: 'Al tron hi seu una ombra amb el teu rostre. Se’t llança a sobre. Només tens el teu do i l’avís de la porta: la victòria et lligarà aquí. Darrere teu, una finestra s’obre al món despert.',
    },
    kindness: { name: 'Un favor retornat' },
    promise: {
      name: 'La promesa complerta',
      text: '#property_deed La llum que vas portar a aquest lloc impedeix que la corona et reclami. Ara ho recordes: vas ser la primera persona que va empresonar, i vas prometre alliberar la resta. A l’alba, mil ànimes adormides tornen a casa al teu costat.',
    },
    nextGuardian: {
      name: 'El següent guardià',
      text: '#property_deed El guardià cau. La corona se’t posa al front. Ara ho recordes: així és com vas perdre el teu nom la primera vegada. A fora, clareja. A dins, #property_title espera les properes passes.',
    },
    ownName: {
      name: 'Un nom propi',
      text: 'Saltes cap al matí. Darrere teu, la corona crida un nom que ja no necessites. Que la ciutadella recordi #property_title. Tu tries el camí, el món dels vius i un nom que encara t’has de guanyar.',
    },
  },
}
