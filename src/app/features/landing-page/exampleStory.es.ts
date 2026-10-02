import type { ExampleStoryCopy } from './exampleStory'

export const exampleStoryEs: ExampleStoryCopy = {
  title: 'El último umbral',
  refs: {
    blade: 'Espada',
    shadow: 'Sombra',
    ember: 'Brasa',
    spirit: 'Espíritu del farol liberado',
    sigil: 'Sello lunar robado',
    title: 'Título olvidado',
    deed: 'Hazaña final',
  },
  titles: {
    blade: 'la Última Espada',
    shadow: 'la Sombra sin Rostro',
    ember: 'la Brasa Eterna',
  },
  skills: {
    blade: {
      answer: 'Corta su sombra con tu espada',
      deed: 'Tu espada corta la sombra que ata el trono.',
    },
    shadow: {
      answer: 'Deslízate en su sombra y ataca',
      deed: 'Te deslizas por su sombra y quiebras la oscuridad desde dentro.',
    },
    ember: {
      answer: 'Quema la oscuridad con tu última brasa',
      deed: 'Tu última brasa quema la oscuridad de la corona.',
    },
  },
  retreat: 'Deja la corona. Elige el alba.',
  nodes: {
    citadel: {
      name: 'Por fin, la ciudadela',
      text: 'Tras años siguiendo una voz en tus sueños, llegas a la Ciudadela Hueca. Bajo la capucha, te arde una vieja cicatriz. No recuerdas ningún nombre, solo una promesa: llegar a la corona antes del alba. Tres entradas. Un don en el que aún confías.',
      blade: 'Espada — cruza el puente de los centinelas',
      shadow: 'Sombra — sube la escalera embrujada',
      ember: 'Brasa — entra por la puerta de fuego vivo',
    },
    bridge: {
      name: 'El puente de los centinelas',
      text: 'Los centinelas de piedra alzan sus espadas. Tras ellos, un espíritu del farol cuelga encadenado. Tu espada encuentra el punto débil: un solo golpe puede liberarlo, o hundir el puente y a sus guardianes en el abismo.',
      free: 'Ábrete paso luchando. Libera al espíritu.',
      cut: 'Corta el puente. Salta en solitario.',
    },
    stair: {
      name: 'La escalera embrujada',
      text: 'Fantasmas hambrientos barren la escalera. Te deslizas entre sus sombras sin que nadie te vea. Un sello lunar brilla en la mano de su guardián; a su lado parpadea un espíritu del farol atrapado. Puedes llevarte uno antes de que se vuelvan.',
      steal: 'Roba el sello lunar',
      hide: 'Esconde al espíritu en tu sombra',
    },
    gate: {
      name: 'La puerta de fuego vivo',
      text: 'La puerta respira fuego. Un sello lunar mantiene abiertas sus fauces. La brasa de tu mano puede calmar las llamas lo justo para tomarlo, o convertir su furia en un camino que la atraviese.',
      tame: 'Doma el fuego. Toma el sello.',
      walk: 'Cruza entre las llamas',
    },
    light: {
      name: 'Una luz recuerda',
      text: 'Superas el peligro con una pequeña luz a tu lado. «Te llamaban #property_title», susurra el espíritu. «Ya viniste una vez a romper la corona. Esta vez, deja que te ayude». Tras la puerta interior, algo despierta.',
      approach: 'Acercaos juntos al trono',
    },
    sigil: {
      name: 'El sello robado',
      text: 'Te cuelas dentro, con el sello lunar frío en la palma. Su inscripción te llama #property_title. Debajo: «La corona es una prisión. Esta es su llave». Tras la puerta interior, algo despierta.',
      carry: 'Lleva el sello hasta el trono',
    },
    haste: {
      name: 'El precio de la prisa',
      text: 'Caes dentro con la capa rasgada, pero sigues con vida. Sin aliados. Sin reliquias. En la puerta interior, una talla te nombra #property_title. Le sigue una advertencia: «Quien derrote al guardián coronado ocupará su lugar». El pomo empieza a girar.',
      face: 'Enfréntate a lo que espera dentro',
    },
    brought: { name: 'Lo que traes contigo' },
    guardianLight: {
      name: 'El guardián y la luz',
      text: 'En el trono se sienta una sombra con tu rostro. Se abalanza sobre ti. El espíritu que salvaste destella entre ambos. «Recuerdo tu verdadero nombre», dice. «Contenla, o confía en mí y deja que hable». El alba roza las ventanas.',
      speak: 'Deja que el espíritu pronuncie tu verdadero nombre',
      deed: 'El espíritu pronuncia tu verdadero nombre. La sombra se arrodilla; la corona se agrieta.',
    },
    guardianKey: {
      name: 'El guardián y la llave',
      text: 'En el trono se sienta una sombra con tu rostro. Se abalanza sobre ti. El sello robado tira hacia un hueco de su corona. Tu don puede derrotar al guardián, pero la llave podría acabar con su maldición. El alba roza las ventanas.',
      fit: 'Encaja el sello robado en la corona',
      deed: 'Esquivas su zarpazo y giras el sello robado en la corona. La prisión se abre.',
    },
    guardianAlone: {
      name: 'El guardián, a solas',
      text: 'En el trono se sienta una sombra con tu rostro. Se abalanza sobre ti. Solo tienes tu don y la advertencia de la puerta: la victoria te atará a este lugar. A tu espalda, una ventana se abre al mundo despierto.',
    },
    kindness: { name: 'Un favor devuelto' },
    promise: {
      name: 'La promesa cumplida',
      text: '#property_deed La luz que trajiste a este lugar impide que la corona te reclame. Ahora lo recuerdas: fuiste la primera persona que encerró, y prometiste liberar al resto. Al alba, mil almas dormidas vuelven a casa a tu lado.',
    },
    nextGuardian: {
      name: 'El siguiente guardián',
      text: '#property_deed El guardián cae. La corona se posa sobre tu frente. Ahora lo recuerdas: así perdiste tu nombre la primera vez. Fuera, despunta el alba. Dentro, #property_title espera los próximos pasos.',
    },
    ownName: {
      name: 'Un nombre propio',
      text: 'Saltas hacia la mañana. A tu espalda, la corona grita un nombre que ya no necesitas. Que la ciudadela recuerde a #property_title. Tú eliges el camino, el mundo de los vivos y un nombre que aún has de ganarte.',
    },
  },
}
