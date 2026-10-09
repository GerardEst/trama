import type { GuideGroup } from './feature-guide.content'

// Mirrors FEATURE_GUIDE chapter by chapter; ids stay in English so links are shared.
export const FEATURE_GUIDE_ES: readonly GuideGroup[] = [
  {
    title: 'Lógica y estado del jugador',
    description:
      'Configura los cambios de estado, los requisitos de las respuestas y las conexiones entre nodos.',
    features: [
      {
        id: 'content-nodes',
        title: 'Nodos de contenido',
        summary:
          'Un nodo de contenido es una escena: muestra un pasaje y puede ofrecer respuestas para que el jugador elija su camino.',
        steps: [
          'Crea un nodo de contenido en el tablero y escribe su pasaje.',
          'Añade respuestas con las decisiones que puede tomar el jugador.',
          'Conecta cada respuesta con su nodo de destino. Si no hay respuestas, conecta el nodo directamente con la siguiente escena.',
        ],
        example: {
          label: 'Una escena con dos caminos',
          lines: [
            'Pasaje: Llegas a una encrucijada.',
            'Respuesta: Entrar en el bosque → escena del bosque',
            'Respuesta: Seguir el río → escena del río',
          ],
        },
        note: 'También puedes añadir una imagen y eventos a la escena. Las respuestas necesitan un destino conectado para poder elegirlas; los requisitos pueden limitar qué respuestas están disponibles.',
      },
      {
        id: 'events',
        title: 'Eventos en escenas y decisiones',
        summary:
          'Los eventos modifican estadísticas numéricas, condiciones o propiedades de texto cuando el jugador llega a un nodo o selecciona una respuesta.',
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
        title: 'Caminos condicionales',
        summary:
          'Usa un distribuidor para seleccionar el siguiente nodo según el valor de una estadística numérica o de una condición del jugador.',
        steps: [
          'Usa eventos para registrar una estadística numérica o una condición verdadera/falsa durante la historia.',
          'Conecta el camino a un nodo distribuidor que compruebe esas referencias.',
          'Conecta cada ruta que se cumpla con su escena y añade un destino En otro caso para el resto.',
        ],
        example: {
          label: 'Ejemplo: ruta según una condición',
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
          'Los requisitos restringen la disponibilidad de una respuesta según un valor numérico mínimo o una condición verdadera o falsa. Todos los requisitos de la respuesta deben cumplirse.',
        steps: [
          'Elige Añadir requisito en la respuesta que quieras restringir.',
          'Selecciona una estadística numérica y su valor mínimo, o una condición que deba ser verdadera o falsa.',
          'Añade más requisitos si hace falta. El jugador debe cumplir todos los requisitos de esa respuesta.',
        ],
        example: {
          label: 'Ejemplo: requisitos de dos respuestas',
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
          label: 'Ejemplo: orden de las rutas',
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
    title: 'Texto, imágenes y opciones para compartir',
    description:
      'Recoge texto del jugador, inserta valores en los pasajes y configura imágenes y opciones para compartir.',
    features: [
      {
        id: 'player-input',
        title: 'Pide texto al jugador',
        summary:
          'Un nodo de texto libre guarda la respuesta escrita del jugador en una propiedad de la partida. Esta propiedad se puede reutilizar en escenas y respuestas.',
        steps: [
          'Crea un nodo de texto libre y escribe la pregunta en su campo Pregunta.',
          'Indica en Propiedad una clave como nombre. Ahí se guarda la respuesta del jugador.',
          'Añade un texto de ejemplo si te resulta útil y conecta el nodo con la siguiente escena.',
          'Reutiliza esa propiedad en escenas o respuestas posteriores con una variable.',
        ],
        example: {
          label: 'Ejemplo: guardar y mostrar un nombre',
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
          'Las variables muestran el valor actual de una propiedad, una estadística numérica o una condición dentro del texto de una escena o una respuesta.',
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
        title: 'Imágenes en los nodos',
        summary:
          'Los nodos de contenido, de texto libre y finales pueden mostrar una imagen encima del pasaje. Los nodos distribuidores no admiten imágenes.',
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
          'Los nodos finales pueden ofrecer un botón para compartir la historia y enlaces externos. El mensaje y el texto del botón se configuran para cada final.',
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
    title: 'Edición y organización del tablero',
    description:
      'Edita los pasajes en una vista ampliada y organiza los nodos con grupos o marcos.',
    features: [
      {
        id: 'focus-mode',
        title: 'Modo concentración para pasajes largos',
        summary:
          'El modo concentración amplía el campo de texto de una escena o una respuesta y ofrece herramientas de formato e inserción de variables.',
        steps: [
          'Usa el botón de ampliar del campo de texto de una escena o de una respuesta para abrir el modo concentración.',
          'Escribe con negrita, cursiva y variables. Los pasajes de las escenas también admiten títulos y listas.',
          'Elige Cerrar, o pulsa Escape, para aplicar lo que has escrito al nodo.',
        ],
        example: {
          label: 'Ejemplo: editar un pasaje',
          lines: [
            'Abre una escena → amplía su campo de texto',
            'Edita el texto y aplica el formato en la vista ampliada',
            'Cerrar → vuelves al mismo mapa de la historia',
          ],
        },
        note: 'Ctrl+F o ⌘F abre el modo concentración mientras un campo de texto de la historia está activo. Los campos de las respuestas usan una barra de formato en línea más sencilla.',
      },
      {
        id: 'organisation',
        title: 'Grupos y marcos móviles',
        summary:
          'Los grupos contienen nodos en un tablero interno. Los marcos mantienen los nodos visibles en el tablero actual y permiten moverlos conjuntamente.',
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
        note: 'Los grupos y los marcos son herramientas para organizar el editor, no escenas jugables. No cambian la lógica de la historia. El marcador Inicio se queda en el tablero principal y puede apuntar a una escena dentro de un grupo.',
      },
    ],
  },
]
