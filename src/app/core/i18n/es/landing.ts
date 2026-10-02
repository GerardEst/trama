import type { Dictionary } from '../i18n.types'

export const landing: Dictionary['landing'] = {
  meta: {
    title: 'Trama — Tú escribes la historia. Ellos eligen el camino.',
    description:
      'Tú escribes la historia. Ellos eligen el camino. Crea historias interactivas en un lienzo visual, compártelas con un solo enlace y descubre adónde van tus lectores.',
  },
  nav: {
    label: 'Navegación principal',
    home: 'Inicio de Trama',
    skip: 'Saltar al contenido',
    features: 'Funciones',
    pricing: 'Precios',
    docs: 'Documentación',
    login: 'Iniciar sesión',
    dashboard: 'Panel',
    start: 'Empieza gratis',
  },
  hero: {
    eyebrow: 'UN HOGAR PARA HISTORIAS INTERACTIVAS',
    titleStart: 'Tú escribes la historia.',
    titleEnd: 'Ellos eligen el camino.',
    description:
      'Construye un mundo de escenas y decisiones en un lienzo visual. Comparte tu historia interactiva con un solo enlace y descubre adónde van tus lectores.',
    openDashboard: 'Abre tu panel',
    startStory: 'Empieza tu historia',
    tryStory: 'Prueba una historia',
    free: '✓ Gratis para empezar',
    noCard: '✓ Sin tarjeta de crédito',
    noAccount: '✓ Los lectores no necesitan cuenta',
    demoLabel: 'Juega a El último umbral',
  },
  demo: {
    heading: 'UNA HISTORIA REAL. TU PRÓXIMO MOVIMIENTO.',
    titleStart: 'EL ÚLTIMO',
    titleEnd: 'UMBRAL',
    endingStart: 'Ese final era tuyo.',
    endingEnd: 'Ahora escribe el comienzo de otra persona.',
    makeAnother: 'Crea otra historia',
    createFirst: 'Crea tu primera historia gratis',
    ended: 'Cada decisión lleva a otro lugar.',
    intro: 'Sin registro. Elige un camino.',
    restart: 'Volver a empezar',
  },
  features: {
    eyebrow: 'MÁS ALLÁ DE LAS RAMIFICACIONES',
    titleStart: 'Historias que',
    titleEnd: 'recuerdan.',
    description:
      'Decisiones que importan, caminos que se adaptan y un tablero que sigue siendo legible a medida que crece tu mundo. Todo sin escribir una línea de código.',
    readGuide: 'Consulta la documentación',
    events: {
      label: 'EVENTOS',
      title: 'Decisiones con consecuencias',
      description:
        'Lleva la cuenta de monedas, descubrimientos, confianza y todo lo que tu historia necesite recordar. Cada escena y cada respuesta pueden cambiar el estado del jugador, sin código.',
      link: 'Descubre cómo funcionan los eventos',
    },
    distributors: {
      label: 'DISTRIBUIDORES',
      title: 'Caminos que dependen del jugador',
      description:
        'Dirige a los lectores según lo que han hecho. Gana la primera ruta que se cumple, y el resto pasa a «En otro caso».',
      link: 'Conoce los nodos distribuidores',
    },
    playerInput: {
      label: 'TEXTO DEL JUGADOR',
      title: 'Las palabras del lector, en tu historia',
      description:
        'Pide un nombre o una idea y entrelázalo en pasajes posteriores con una variable.',
      link: 'Pregunta al jugador',
    },
    requirements: {
      label: 'REQUISITOS',
      title: 'Respuestas que hay que ganarse',
      description:
        'Una llave encontrada abre la puerta. Suficientes monedas compran el mapa. Las respuestas solo aparecen cuando el jugador cumple todos los requisitos.',
      link: 'Añade requisitos',
    },
    focusMode: {
      label: 'MODO CONCENTRACIÓN',
      title: 'Espacio para escribir',
      description:
        'Sal del lienzo a un editor sin distracciones para pasajes largos, con títulos, listas y variables. Ciérralo y vuelves al mismo mapa.',
      link: 'Prueba el modo concentración',
    },
    organisation: {
      label: 'GRUPOS Y MARCOS',
      title: 'Historias grandes, aún legibles',
      description:
        'Pliega un capítulo en un grupo o mantenlo visible dentro de un marco móvil.',
      link: 'Organiza tu tablero',
    },
  },
  visuals: {
    distributor: 'Distribuidor',
    secretRule: 'confianza > 2 Y tiene_llave',
    secretEntrance: 'Entrada secreta',
    frontRule: 'confianza > 2',
    frontEntrance: 'Entrada principal',
    otherwise: 'En otro caso',
    gatekeeper: 'Guardián',
    askName: '¿Cómo quieres que te llamemos?',
    welcomeBack: 'Hola de nuevo,',
    nameToken: '#nombre',
    coins: 'monedas 2',
    hasKey: 'tiene_llave ✓',
    openArchive: 'Abrir el archivo',
    requiresKey: 'requiere tiene_llave',
    buyMap: 'Comprar el mapa',
    requiresCoins: 'requiere 3 monedas',
    walkAway: 'Marcharse',
    close: 'Cerrar',
    chapterHeading: 'Capítulo 2 · El archivo',
    passageStart:
      'La puerta cedió con un suspiro, como si hubiera estado esperando a',
    passageEnd:
      'desde siempre. El polvo flotaba a la luz del farol y se posaba en estanterías que se adentraban más de lo que el edificio debería permitir.',
    chapter2: 'Capítulo 2',
    chapter3: 'Capítulo 3',
    scenes: '6 escenas',
  },
  pricing: {
    titleStart: 'Empieza gratis.',
    titleEnd: 'Crece a partir de ahí.',
    description: 'Más espacio cuando lo necesites.',
    license: {
      audience: 'PARA PROFESIONALES',
      badge: 'Próximamente',
      title: 'Licencia de exportación',
      preview: 'Licencia propuesta. Aún no se puede comprar.',
      frequencyStart: 'Un único pago.',
      frequencyEnd: 'Sin suscripción.',
      description:
        'Todas las herramientas de creación. Exportaciones ilimitadas. Aloja, distribuye o vende tus historias en tus propios términos.',
      ownership: 'Tu plataforma. Tus ingresos. Sin royalties.',
      limit:
        'Solo exportación. Sin juegos alojados en Trama, enlaces para compartir ni analíticas de jugadores.',
      ask: 'Pregunta por la licencia',
      subject: 'Consulta sobre la licencia de exportación',
    },
  },
  questions: {
    title: 'Algunos cabos sueltos.',
    free: {
      question: '¿Puedo empezar gratis?',
      answer:
        'Sí. El plan Basic es gratuito, así que puedes crear y compartir tus primeras historias antes de decidir si necesitas más espacio.',
    },
    readers: {
      question: '¿Los lectores necesitan una cuenta?',
      answer:
        'No. Comparte un enlace y los lectores pueden entrar directamente en tu historia sin registrarse ni instalar nada.',
    },
    export: {
      question: '¿Puedo exportar o alojar mis historias por mi cuenta?',
      answer:
        'Las historias viven en Trama y se comparten con un enlace. Para estudios y autores que quieran alojarlas o venderlas en su propia plataforma, estamos preparando una licencia de exportación de pago único.',
    },
    create: {
      question: '¿Qué puedo crear con Trama?',
      answer:
        'Ficción interactiva, aventuras ramificadas, cuestionarios y otras experiencias de «elige tu propio camino». Empieza con una escena y descubre adónde te lleva.',
    },
  },
  closing: {
    label: 'TU PRÓXIMA ESCENA',
    titleStart: '¿Qué pasa',
    titleEnd: 'después?',
    yours: 'Esa parte la escribes tú.',
  },
  footer: {
    tagline: 'Las historias no tienen por qué ir en línea recta.',
    guide: 'Documentación',
    pricing: 'Precios',
    login: 'Iniciar sesión',
    email: 'Escribe al creador',
    rights: '© trama.app · Todos los derechos reservados',
  },
}
