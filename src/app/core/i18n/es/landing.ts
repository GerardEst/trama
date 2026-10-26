import type { Dictionary } from '../i18n.types'

export const landing: Dictionary['landing'] = {
  meta: {
    title: 'Trama — Tú escribes la historia. Ellos eligen el camino.',
    description:
      'Escribe ficción interactiva sin programar. Conecta escenas y decisiones, prueba sus consecuencias, corrige mientras juegas y comparte la historia con un enlace.',
  },
  nav: {
    label: 'Navegación principal',
    home: 'Inicio de Trama',
    skip: 'Saltar al contenido',
    authoring: 'Cómo funciona',
    features: 'Funciones',
    pricing: 'Precios',
    docs: 'Documentación',
    login: 'Iniciar sesión',
    dashboard: 'Panel',
    start: 'Elige Creator',
  },
  hero: {
    eyebrow: 'PARA AUTORES DE FICCIÓN INTERACTIVA',
    titleStart: 'Tú escribes la historia.',
    titleEnd: 'Ellos eligen el camino.',
    description:
      'Escribe escenas, conecta decisiones y prueba cómo cambia la historia con cada camino. Corrige los pasajes mientras la recorres y compártela con un enlace. Sin programar.',
    openDashboard: 'Abre tu panel',
    startStory: 'Crea tu primera historia',
    tryStory: 'Juega una historia',
    free: '✓ Todas las funciones del editor incluidas',
    noCard: '✓ Facturación mensual o anual',
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
    createFirst: 'Crea tu primera historia',
    ended: 'Cada decisión lleva a otro lugar.',
    intro: 'Sin registro. Elige un camino.',
    restart: 'Volver a empezar',
  },
  demoBridge: {
    description: 'Liberar al espíritu o coger el sello lunar cambia lo que puedes hacer más adelante. Tú decides qué decisiones recuerda tu historia.',
    action: 'Mira cómo se construye',
  },
  authoring: {
    eyebrow: 'TU HISTORIA, PASO A PASO',
    title: 'De la primera escena a una historia para compartir.',
    description: 'Escribe los pasajes. Da forma a los caminos en el mapa. Recórrelos y corrige sobre la marcha, sin salir de tu historia.',
    enlarge: 'Abre la captura del editor a tamaño completo (pestaña nueva)',
    realCapture: 'Editor real · Historia de ejemplo',
    write: {
      title: 'Escribe',
      description: 'Da espacio a los pasajes largos en el editor de texto.',
      caption: 'Edita pasajes y respuestas en el panel de lectura. Crea escenas nuevas y conexiones en el mapa.',
      alt: 'El editor de Trama con el mapa de la historia junto a un pasaje editable y sus respuestas.',
    },
    map: {
      title: 'Conecta',
      description: 'Enlaza decisiones con escenas y organiza los caminos en el mapa.',
      caption: 'El tablero muestra las escenas, las respuestas y las conexiones entre ellas.',
      alt: 'El tablero de Trama con escenas conectadas y dos caminos distintos en una historia de ejemplo.',
    },
    preview: {
      title: 'Prueba y corrige',
      description: 'Sigue un camino, vuelve atrás y pasa a editar cuando un pasaje lo necesite.',
      caption: 'La vista previa recorre la historia junto al mapa. Pasa a Editar para corregir el pasaje actual.',
      alt: 'La vista previa de lectura de Trama junto al mapa, con decisiones y botones para volver atrás y editar.',
    },
    share: {
      title: 'Comparte',
      description: 'Envía un enlace directo a los lectores. No necesitan cuenta.',
      caption: 'Copia el enlace de la historia desde la ventana para compartir y envíaselo a tus lectores.',
      alt: 'La ventana para compartir de Trama con el enlace de una historia y el botón para copiarlo.',
    },
  },
  trust: {
    eyebrow: 'CREADA POR TI',
    title: 'Tú pones la voz. Trama pone las herramientas.',
    description: 'Las palabras, los personajes y las decisiones los escribes tú. Trama no genera el texto por ti.',
    saving: {
      title: 'Sabes cuándo se ha guardado',
      description: 'Los cambios se guardan automáticamente. Si falla un guardado, el editor muestra un aviso y te permite volver a intentarlo.',
    },
    history: {
      title: 'Puedes cambiar de idea',
      description: 'Deshaz y rehace cambios recientes mientras trabajas. El historial de la sesión no es un archivo permanente de versiones.',
    },
    data: {
      title: 'Descarga los datos de la historia',
      description: 'Descarga un JSON desde las opciones de la historia. Contiene el texto, la estructura y la configuración, no un juego independiente ni las imágenes empaquetadas.',
    },
  },
  features: {
    eyebrow: 'MÁS ALLÁ DE LAS RAMIFICACIONES',
    titleStart: 'Historias que',
    titleEnd: 'recuerdan.',
    description:
      'Una promesa cumplida, una llave encontrada, una amistad ganada. Haz que las decisiones anteriores cambien lo que pasa después, sin escribir código.',
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
      title: 'El pasado cambia lo que pasa después',
      description:
        'Un aliado que confía en el lector lo deja entrar. Un desconocido debe encontrar otra entrada. Define rutas diferentes según lo que ha hecho el lector.',
      link: 'Conoce los nodos distribuidores',
    },
    playerInput: {
      label: 'TEXTO DEL JUGADOR',
      title: 'Haz sitio al lector dentro de la historia',
      description:
        'Pide un nombre o una idea y entrelázalo en pasajes posteriores con una variable.',
      link: 'Pregunta al jugador',
    },
    requirements: {
      label: 'REQUISITOS',
      title: 'No todas las opciones se abren desde el principio',
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
      title: 'Dale un lugar a cada capítulo',
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
    titleStart: 'Crea con Creator.',
    titleEnd: 'Pro vendrá después.',
    description: 'Creator incluye todas las funciones actuales del editor. El selector de facturación solo se aplica a Creator. Pro será de pago único y aún no está a la venta.',
  },
  questions: {
    title: 'Algunos cabos sueltos.',
    code: {
      question: '¿Tengo que saber programar?',
      answer: 'No. Escribe pasajes en el editor de texto, conecta escenas en el tablero y configura eventos y requisitos visualmente. La documentación explica las herramientas con ejemplos.',
    },
    free: {
      question: '¿Qué planes están disponibles?',
      answer: 'Creator está disponible con facturación mensual o anual y todas las funciones actuales del editor incluidas. Pro está previsto como un pago único de unos 200 € con exportación de historias, pero aún no está disponible. El precio, el formato y el alcance de la exportación no son definitivos.',
    },
    readers: {
      question: '¿Los lectores necesitan una cuenta?',
      answer: 'No. Comparte un enlace y los lectores pueden entrar directamente en tu historia sin registrarse ni instalar nada.',
    },
    download: {
      question: '¿Puedo descargar los datos de la historia?',
      answer: 'Sí. Abre las opciones de la historia en el panel y elige Exportar JSON. El archivo incluye el texto, la estructura y la configuración. Las imágenes siguen siendo referencias externas; no se empaquetan. Aún no hay una herramienta de importación o restauración para el usuario.',
    },
    export: {
      question: '¿Puedo alojar una historia jugable en mi web?',
      answer: 'Todavía no. Hoy los lectores juegan con un enlace de Trama. La descarga JSON contiene datos de la historia, no un juego HTML independiente. La exportación jugable está prevista para Pro, pero su formato, alcance y fecha de lanzamiento aún están por decidir.',
    },
    cancel: {
      question: '¿Qué pasa si cancelo Creator?',
      answer: 'Puedes solicitar la cancelación desde tu cuenta. Descarga los datos de la historia en JSON antes de cambiar de plan. Si necesitas confirmar la fecha efectiva de cancelación o el acceso a las historias y los enlaces, escríbenos antes de cancelar. Pro es una propuesta futura independiente, no una migración automática.',
      contact: 'Consulta tu suscripción',
    },
    create: {
      question: '¿Qué puedo crear con Trama?',
      answer: 'Ficción interactiva y aventuras ramificadas con consecuencias. Empieza con una escena, ofrece una decisión al lector y elige qué recuerda la historia.',
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
