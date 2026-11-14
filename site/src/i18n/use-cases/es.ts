import type { UseCasesCopy } from './en'

export const useCases: UseCasesCopy = {
  meta: {
    title: 'Casos de uso — Trama',
    description:
      'Cómo usan Trama, el editor sin código de historias interactivas con ramas, los escritores, los creadores de juegos narrativos y las marcas: las herramientas que más pesan en cada caso y el plan que encaja.',
  },
  eyebrow: 'Casos de uso',
  titleStart: 'Un mismo editor.',
  titleEnd: 'Historias muy distintas.',
  lead: 'Trama sirve para cualquier historia donde el lector decide. Así la usan escritores, creadores de juegos y marcas, con las herramientas que más pesan en cada caso.',
  makesLabel: 'Se usa para',
  toolsTitle: 'Las herramientas que más pesan',
  planLabel: 'Plan recomendado',
  planLink: 'Ver precios',
  cases: {
    writers: {
      name: 'Escritores creativos',
      title: 'Tu ficción, con más de un camino.',
      lead: 'Para relatos, novelas y librojuegos donde el lector decide.',
      heading: 'Escribe como siempre. Ramifica cuando quieras.',
      body: 'Empieza con una escena y una decisión. El resto es escribir: pasajes largos con formato, un editor a página completa y un tablero que muestra adónde lleva cada camino. No tienes que aprender ningún lenguaje, y Trama nunca escribe el texto por ti.',
      makes: ['Ficción interactiva', 'Librojuegos', 'Relatos con varios finales'],
      plan: 'Todo lo que necesita un escritor está en Creative.',
    },
    games: {
      name: 'Juegos narrativos',
      title: 'Lógica de juego sin programar.',
      lead: 'Para aventuras de texto, misterios y RPG narrativos donde el estado del jugador importa.',
      heading: 'La historia lleva la cuenta.',
      body: 'Cada decisión puede sumar a un número, activar una condición o guardar un texto. Las respuestas quedan bloqueadas hasta que el jugador tiene lo necesario, y un distribuidor envía cada partida por una ruta distinta según lo que ha pasado antes. Todo se configura con formularios, y el motor abierto juega la misma historia en tu pantalla de juego.',
      makes: ['Aventuras de texto', 'Misterios con pistas', 'RPG narrativos'],
      plan: 'Creative incluye toda la lógica. El motor es gratuito.',
    },
    brands: {
      name: 'Marcas',
      title: 'Una historia que tu público juega.',
      lead: 'Para campañas, lanzamientos y contenidos donde el público elige, y tú quieres saber qué ha elegido.',
      heading: 'Con tu nombre, y con los datos.',
      body: 'Publica la historia con tu pie y tu enlace en lugar de los de Trama, en una dirección fácil de recordar. Cada final puede llevar a los lectores a tu web. Con Pro ves cada partida: quién ha jugado y con qué ha terminado.',
      makes: ['Campañas interactivas', 'Historias de marca', 'Cuestionarios con resultado'],
      plan: 'Pro añade las analíticas a todo lo que incluye Creative.',
    },
  },
  scene: {
    reader: 'Morgan',
    ending: 'Fin',
    visit: 'Visita nuestra web',
  },
}
