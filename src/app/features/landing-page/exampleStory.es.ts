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
      deed: 'Tu espada atraviesa la sombra del guardián.',
    },
    shadow: {
      answer: 'Deslízate en su sombra y ataca',
      deed: 'Te deslizas en la sombra del guardián y atacas desde dentro.',
    },
    ember: {
      answer: 'Quema la oscuridad con tu última brasa',
      deed: 'Tu última brasa quema la sombra del guardián.',
    },
  },
  retreat: 'Deja la corona. Elige el alba.',
  nodes: {
    citadel: {
      name: 'Por fin, la ciudadela',
      text: '<p>«Prometiste volver». La voz de tus sueños te guía hasta la <strong>Ciudadela Hueca</strong>, donde una corona encierra almas robadas.</p><p>Escapaste, pero perdiste la memoria. <em>Libera al resto antes de que el alba selle las puertas durante un año.</em> ¿Con qué don entrarás?</p>',
      blade: '<strong>Espada</strong> — cruza el puente de los centinelas',
      shadow: '<strong>Sombra</strong> — sube la escalera embrujada',
      ember: '<strong>Brasa</strong> — entra por la puerta de fuego vivo',
    },
    bridge: {
      name: 'El puente de los centinelas',
      text: '<p>Los centinelas de piedra bloquean el puente. Tras ellos, un <strong>espíritu del farol</strong> encadenado pide ayuda.</p><p>Puedes abrirte paso para liberarlo, o cortar las cadenas del puente y saltar al otro lado mientras los centinelas caen.</p>',
      free: 'Ábrete paso luchando. Libera al espíritu.',
      cut: 'Corta el puente. Salta en solitario.',
    },
    stair: {
      name: 'La escalera embrujada',
      text: '<p>Subes sin ser visto entre fantasmas dormidos. Su vigilante lleva un <strong>sello lunar</strong>; a su lado, un espíritu del farol brilla en una jaula.</p><p>Un fantasma se mueve. Tienes tiempo de tomar la llave o liberar al cautivo.</p>',
      steal: 'Roba el sello lunar',
      hide: 'Esconde al espíritu en tu sombra',
    },
    gate: {
      name: 'La puerta de fuego vivo',
      text: '<p>Un <strong>sello lunar</strong> alimenta el fuego de la puerta. Tu brasa puede calmar las llamas mientras lo retiras, o protegerte si las cruzas deprisa.</p><p>Tomar el sello te costará un tiempo precioso.</p>',
      tame: 'Doma el fuego. Toma el sello.',
      walk: 'Cruza entre las llamas',
    },
    brought: { name: 'Lo que traes contigo' },
    guardianLight: {
      name: 'El guardián y la luz',
      text: '<p>Tu propia sombra custodia el trono: la parte de ti que la corona retuvo cuando escapaste.</p><p>«Te llamaban <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>», susurra el espíritu. «Tu verdadero nombre puede romper la corona. Lucha para darme tiempo, o déjame decirlo ahora».</p><p><em>La sombra se abalanza sobre ti. El alba se acerca.</em> A tu espalda hay una puerta de salida.</p>',
      speak: 'Deja que el espíritu pronuncie tu verdadero nombre',
      deed: 'Bajas la guardia. El espíritu se interpone entre tú y tu sombra.',
    },
    guardianKey: {
      name: 'El guardián y la llave',
      text: '<p>Tu propia sombra custodia el trono: la parte de ti que la corona retuvo cuando escapaste.</p><p>El sello dice <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>. Encaja en un hueco de la corona: <em>es la llave de la prisión</em>.</p><p>Destruye al guardián y ocupa su lugar, o usa la llave para liberar a todos. Una puerta a tu espalda lleva fuera.</p>',
      fit: 'Encaja el sello robado en la corona',
      deed: 'Esquivas su zarpazo y giras el sello en la corona. Resuena tu verdadero nombre.',
    },
    guardianAlone: {
      name: 'El guardián, a solas',
      text: '<p>Tu propia sombra custodia el trono: la parte de ti que la corona retuvo cuando escapaste.</p><p>«Has vuelto, <strong><span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span></strong>». Señala la corona. «Si me destruyes, ocuparás mi lugar».</p><p>No traes ninguna llave ni ningún aliado. <em>Lucha, o sal por la puerta a tu espalda antes del alba.</em></p>',
    },
    kindness: { name: 'Un favor devuelto' },
    promise: {
      name: 'La promesa cumplida',
      text: '<p><span data-trama-variable="" data-kind="property" data-key="property_deed">#property_deed</span></p><p>Tu nombre resuena y rompe el hechizo. <strong>La corona se deshace</strong>; tu sombra vuelve a ti y recuperas los recuerdos.</p><p>Reconoces cada rostro entre las almas liberadas. Esta vez, <em>salís juntos</em>.</p>',
    },
    nextGuardian: {
      name: 'El siguiente guardián',
      text: '<p><span data-trama-variable="" data-kind="property" data-key="property_deed">#property_deed</span> El guardián cae. <strong>La corona se posa sobre tu frente.</strong></p><p>Las puertas se cierran con el alba. Has ganado la lucha, pero las almas siguen presas. Ahora las custodia <span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span>.</p>',
    },
    ownName: {
      name: 'Un nombre propio',
      text: '<p>Sales mientras las puertas se cierran. Las almas quedan dentro; <em>tu promesa tendrá que esperar</em>.</p><p>Que la ciudadela recuerde a <span data-trama-variable="" data-kind="property" data-key="property_title">#property_title</span>. Eres libre, y tienes un año para encontrar la manera de volver.</p>',
    },
  },
}
