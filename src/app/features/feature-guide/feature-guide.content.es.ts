import type { GuideGroup } from './feature-guide.content'

// Mirrors FEATURE_GUIDE chapter by chapter; ids stay in English so links are shared.
export const FEATURE_GUIDE_ES: readonly GuideGroup[] = [
  {
    title: 'Que reaccione',
    description:
      'Da consecuencias a las decisiones y haz que la historia las recuerde.',
    features: [
      {
        id: 'events',
        title: 'Eventos en escenas y decisiones',
        summary:
          'Cambia el estado del jugador cuando llega a un nodo o elige una respuesta. Lleva la cuenta de monedas, descubrimientos, confianza y otras consecuencias sin escribir código.',
        steps: [
          'Elige Añadir evento en un nodo para actuar cuando el jugador llegue, o en una respuesta para actuar cuando la elija.',
          'Elige una estadística numérica, una condición verdadera/falsa o una propiedad de texto. Ponle nombre a la referencia para reutilizarla en otros lugares.',
          'Define el cambio: suma o resta un número, activa o desactiva una condición, o asigna un valor a una propiedad.',
        ],
        example: {
          label: 'Una decisión con consecuencias',
          lines: [
            'Ayudar al desconocido → confianza +1',
            'Coger la llave → tiene_llave pasa a ser verdadera',
          ],
        },
        note: 'Los eventos de un nodo se ejecutan en cada llegada, también en las visitas repetidas. Los eventos de una respuesta se ejecutan antes de que la historia pase al siguiente nodo.',
      },
      {
        id: 'conditional-paths',
        title: 'Caminos que dependen del jugador',
        summary:
          'El mismo punto de decisión puede llevar a escenas distintas según lo que haya hecho el jugador. Un visitante de confianza y uno desconocido no tienen por qué recibir la misma bienvenida.',
        steps: [
          'Usa eventos para registrar una estadística numérica o una condición verdadera/falsa durante la historia.',
          'Conecta el camino a un nodo distribuidor que compruebe esas referencias.',
          'Conecta cada ruta que se cumpla con su escena y añade un destino En otro caso para el resto.',
        ],
        example: {
          label: 'Una entrada, dos experiencias',
          lines: [
            'tiene_llave es verdadera → entrar en el archivo',
            'En otro caso → encontrarse con el guardián',
          ],
        },
        note: 'Las rutas comprueban estadísticas numéricas y condiciones verdaderas/falsas. El texto del jugador, como su nombre, se puede reutilizar en la redacción de la historia mediante interpolación.',
      },
      {
        id: 'requirements',
        title: 'Requisitos de las respuestas',
        summary:
          'Haz que una respuesta solo esté disponible cuando el jugador cumpla sus requisitos. Una llave encontrada puede abrir una puerta; suficientes monedas pueden hacer posible una compra.',
        steps: [
          'Elige Añadir requisito en la respuesta que quieras restringir.',
          'Selecciona una estadística numérica y su valor mínimo, o una condición que deba ser verdadera o falsa.',
          'Añade más requisitos si hace falta. El jugador debe cumplir todos los requisitos de esa respuesta.',
        ],
        example: {
          label: 'Ganarse la opción',
          lines: [
            'Comprar el mapa → requiere al menos 3 monedas',
            'Abrir el archivo → requiere tiene_llave',
          ],
        },
        note: 'Las respuestas cuyos requisitos no se cumplen se filtran del modo de juego actual. Conecta las respuestas válidas a un destino para que se puedan elegir.',
      },
      {
        id: 'distributors',
        title: 'Nodos distribuidores',
        summary:
          'Crea rutas más complejas sin mostrar al jugador una pregunta extra. Un distribuidor evalúa sus rutas en orden y continúa por la primera que se cumple.',
        steps: [
          'Crea un nodo distribuidor y añade una ruta.',
          'Elige una referencia y una comparación. Las estadísticas numéricas admiten igual a, menor que y mayor que; las condiciones comprueban si son verdaderas o falsas.',
          'Usa Añadir regla Y para combinar comprobaciones. Todas las reglas de la ruta deben cumplirse.',
          'Usa Subir y Bajar para fijar la prioridad y conecta En otro caso como alternativa.',
        ],
        example: {
          label: 'La prioridad importa',
          lines: [
            'Ruta 1: confianza > 2 Y tiene_llave → entrada secreta',
            'Ruta 2: confianza > 2 → entrada principal',
            'En otro caso → guardián',
          ],
        },
        note: 'Gana la primera ruta que se cumple. Pon las rutas más específicas antes que las más generales. Un distribuidor es un paso de enrutado, no una escena que el jugador lea.',
      },
      {
        id: 'connections',
        title: 'Conectar al texto o directamente a las respuestas',
        summary:
          'Elige si una conexión muestra el pasaje del siguiente nodo o salta directamente a sus respuestas. Vuelve a un menú sin obligar al jugador a releer su introducción.',
        steps: [
          'Arrastra una conexión desde un nodo, una respuesta o una ruta de un distribuidor hasta su destino.',
          'Conéctala a la entrada principal del nodo de destino para mostrar su texto y después sus respuestas.',
          'Conéctala a la entrada de respuestas para saltarte el pasaje y ofrecer las opciones directamente.',
        ],
        example: {
          label: 'Dos maneras de volver a la misma escena',
          lines: [
            'Primera visita → texto del mercado + opciones de compra',
            'Vuelta de una tienda → solo opciones de compra',
          ],
        },
        note: 'Si un destino que solo muestra respuestas no tiene respuestas disponibles, el modo de juego muestra su pasaje. Los eventos del nodo se siguen ejecutando al llegar.',
      },
    ],
  },
  {
    title: 'Hazla personal',
    description:
      'Mete a quien lee en la historia y dale un mundo en el que entrar.',
    features: [
      {
        id: 'player-input',
        title: 'Pide texto al jugador',
        summary:
          'Pide un nombre, una idea u otra respuesta escrita y mantenla disponible durante toda la partida. Las palabras de quien lee pasan a formar parte de tu historia.',
        steps: [
          'Crea un nodo de texto libre y escribe la pregunta en su campo Pregunta.',
          'Indica en Propiedad una clave como nombre. Ahí se guarda la respuesta del jugador.',
          'Añade un texto de ejemplo si te resulta útil y conecta el nodo con la siguiente escena.',
          'Reutiliza esa propiedad en escenas o respuestas posteriores con una variable.',
        ],
        example: {
          label: 'Un nombre que viaja con quien lee',
          lines: [
            'Pregunta: ¿Cómo quieres que te llamemos?',
            'Propiedad: nombre · El jugador escribe: Morgan',
            'Más adelante: Hola de nuevo, #nombre. → Hola de nuevo, Morgan.',
          ],
        },
        note: 'La respuesta pertenece a la partida actual. Por ahora, el modo de juego usa un botón Continuar fijo; los campos guardados Texto del botón y Descripción todavía no se muestran allí.',
      },
      {
        id: 'variables',
        title: 'Variables dentro del texto',
        summary:
          'Deja que la redacción se adapte al jugador. Inserta un nombre, una estadística numérica o una condición en un pasaje o una respuesta en lugar de escribir una escena distinta para cada variante.',
        steps: [
          'Crea la referencia con un evento o guarda una respuesta del jugador en la propiedad de un nodo de texto libre.',
          'Abre el modo concentración y usa Insertar variable para elegir la referencia por su nombre.',
          'Coloca la variable allí donde deba aparecer su valor actual, en una escena o en una respuesta.',
        ],
        example: {
          label: 'De una variable a una frase',
          lines: [
            'Lo has conseguido, #nombre.',
            'Propiedad del jugador nombre = Morgan',
            'Quien lee ve: Lo has conseguido, Morgan.',
          ],
        },
        note: 'El texto plano también admite la sintaxis #variable. Para una propiedad llamada nombre, usa #nombre; las estadísticas numéricas y las condiciones usan sus ID de referencia en texto plano. El selector de variables se encarga de esos ID por ti. Los valores que faltan se muestran como un guion.',
      },
      {
        id: 'images',
        title: 'Imágenes en tus nodos',
        summary:
          'Ambienta la escena con una ilustración, el retrato de un personaje o una pista visual. La imagen acompaña al texto sin sustituir tus decisiones.',
        steps: [
          'Abre el menú de un nodo de contenido, de texto libre o final y elige Añadir imagen.',
          'Elige un archivo de imagen y espera a que termine de subirse.',
          'Previsualiza la historia: la imagen aparece encima del pasaje del nodo.',
        ],
        example: {
          label: 'Una pista visual',
          lines: [
            'Imagen: una carta con el sello roto',
            'Pasaje: La letra te resulta familiar.',
            'Opciones: Leerla / Esconderla',
          ],
        },
        note: 'Los nodos distribuidores sirven para enrutar y no tienen campo de imagen. Basic tiene un límite de imágenes; Creator incluye imágenes ilimitadas.',
      },
      {
        id: 'share-node',
        title: 'Compartir y nodos finales',
        summary:
          'Dale a un final un lugar adonde ir. Invita a quien lee a compartir la aventura, a descubrir tu obra o a visitar tus perfiles sociales.',
        steps: [
          'Crea un nodo final y escribe el pasaje final.',
          'Activa Permitir compartir en las opciones de la historia para ofrecer Compartir esta historia.',
          'Usa Personalizar al compartir para definir el mensaje y el texto del botón de ese final.',
          'Con una suscripción de pago, añade Enlaces externos con tus propios textos y URL, como tu web o tus perfiles de creador.',
        ],
        example: {
          label: 'Después de la escena final',
          lines: [
            'Botón de compartir: Pasa esta aventura',
            'Mensaje compartido: He encontrado la entrada secreta. ¿Y tú?',
            'Enlaces externos: Más historias / Conoce al creador',
          ],
        },
        note: 'Para compartir se usa el menú para compartir del dispositivo cuando está disponible y, si no, se copia el enlace. Los enlaces externos requieren una suscripción de pago. Son enlaces a tus perfiles, no integraciones con cada red social.',
      },
    ],
  },
  {
    title: 'Sigue escribiendo',
    description:
      'Sumérgete en un pasaje sin perder la forma de toda la aventura.',
    features: [
      {
        id: 'focus-mode',
        title: 'Modo concentración para pasajes largos',
        summary:
          'Apártate del lienzo y entra en un editor de texto sin distracciones. Escribe un pasaje largo, dale formato y vuelve al mapa cuando quieras.',
        steps: [
          'Usa el botón de ampliar del campo de texto de una escena o de una respuesta para abrir el modo concentración.',
          'Escribe con negrita, cursiva y variables. Los pasajes de las escenas también admiten títulos y listas.',
          'Elige Cerrar, o pulsa Escape, para aplicar lo que has escrito al nodo.',
        ],
        example: {
          label: 'Del mapa al manuscrito',
          lines: [
            'Abre una escena → amplía su campo de texto',
            'Escribe todo el pasaje sin el ruido del lienzo',
            'Cerrar → vuelves al mismo mapa de la historia',
          ],
        },
        note: 'Ctrl+F o ⌘F abre el modo concentración mientras un campo de texto de la historia está activo. Los campos de las respuestas usan una barra de formato en línea más sencilla.',
      },
      {
        id: 'organisation',
        title: 'Grupos y marcos móviles',
        summary:
          'Mantén comprensible una historia grande. Pliega un capítulo en un grupo o mantén sus escenas visibles dentro de un marco con nombre que se mueve con ellas.',
        steps: [
          'Selecciona nodos relacionados en el lienzo.',
          'Elige Agrupar nodos seleccionados para colocarlos dentro de un grupo. Abre el grupo para trabajar en su contenido y usa Salir para volver.',
          'Elige Enmarcar nodos seleccionados si prefieres mantenerlos visibles juntos en el mismo tablero. Ponle nombre al marco y arrastra su cabecera para mover el conjunto.',
          'Quita un marco cuando ya no lo necesites; sus nodos se quedan en la historia.',
        ],
        example: {
          label: 'Dos maneras de organizar el capítulo 2',
          lines: [
            'Grupo → un contenedor, con las escenas dentro',
            'Marco → todas las escenas visibles, movidas a la vez',
          ],
        },
        note: 'Los grupos y los marcos son herramientas para organizar el editor, no escenas jugables. No cambian la lógica de la historia. El nodo inicial se queda en el tablero principal, no dentro de un grupo.',
      },
    ],
  },
]
