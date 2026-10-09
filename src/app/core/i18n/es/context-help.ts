export const contextHelp = {
  preference: 'Mostrar ayuda contextual',
  explain: 'Ayuda: {topic}',
  documentation: 'Verlo en la documentación',
  newTab: 'Se abre en una pestaña nueva',
  topics: {
    entryPoint: {
      body: 'Inicio indica dónde comienza la aventura. No es una escena ni se muestra al jugador: arrastra el conector hasta el nodo que quieres ejecutar primero. Puedes cambiar esta conexión en cualquier momento. Si queda desconectado, no se puede iniciar la partida.',
    },
    contentNode: {
      body: 'Un nodo de contenido es una escena de tu historia. Escribe el pasaje que leerá el jugador y añade respuestas para que pueda elegir qué ocurre después. Conecta cada respuesta con otro nodo para crear caminos diferentes. Si no hay respuestas, puedes conectar el nodo directamente con la siguiente escena.',
    },
    textNode: {
      body: 'Este nodo hace una pregunta abierta al jugador y guarda el texto que escribe en una propiedad de la partida. Indica qué propiedad quieres usar, como nombre, y conecta el nodo con la siguiente escena. Más adelante puedes insertar la respuesta en el texto de la historia con una variable.',
    },
    distributorNode: {
      body: 'Este nodo elige automáticamente el siguiente camino sin mostrar una escena al jugador. Comprueba las rutas en orden según estadísticas o condiciones y sigue la primera que se cumple. Conecta la salida En otro caso para los casos que no cumplan ninguna ruta.',
    },
    endNode: {
      body: 'Este nodo marca el final de un camino de la historia y muestra el pasaje de despedida al jugador. Puedes crear finales diferentes según las decisiones tomadas. También puedes configurar opciones para compartir la historia y, con una suscripción de pago, añadir enlaces externos.',
    },
    events: {
      title: 'Eventos',
      body: 'Los eventos cambian el estado del jugador cuando se juega un pasaje o una respuesta. Pueden sumar o restar una estadística, activar o desactivar una condición, o establecer una propiedad de texto. Por ejemplo, una respuesta puede dar una llave al jugador para que la use más adelante.',
    },
    requirements: {
      title: 'Requisitos',
      body: 'Los requisitos determinan si una respuesta está disponible para el jugador. Puedes exigir un valor mínimo de una estadística o que una condición esté activa o inactiva. Deben cumplirse todos los requisitos. Por ejemplo, una puerta solo se puede abrir si el jugador tiene una llave.',
    },
    references: {
      title: 'Estadísticas, condiciones y propiedades',
      body: 'Son los valores que la historia recuerda sobre el jugador. Las estadísticas contienen cantidades, como monedas; las condiciones están activas o inactivas, como tener una llave; las propiedades contienen texto, como un nombre. Reutiliza la misma referencia en eventos y comprobaciones para conectar diferentes partes de la historia.',
    },
  },
}
