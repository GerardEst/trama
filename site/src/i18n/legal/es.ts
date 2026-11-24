import type { LegalCopy } from './en'

export const legal: LegalCopy = {
  back: 'Volver a Trama',
  updated: 'Última actualización: {date}',
  contents: 'Índice',
  ownerTitle: 'Datos del titular',
  owner: { name: 'Titular', nif: 'NIF', email: 'Correo electrónico', address: 'Domicilio' },
  privacy: {
    meta: {
      title: 'Política de privacidad — Trama',
      description:
        'Tratamiento de los datos personales en Trama: responsable, finalidades, bases jurídicas, destinatarios, transferencias internacionales, plazos de conservación y derechos.',
    },
    title: 'Política de privacidad',
    intro:
      'Esta Política de privacidad informa a los usuarios de trama.app sobre el tratamiento de sus datos personales, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales.',
    sections: [
      {
        id: 'controller',
        title: 'Responsable del tratamiento',
        blocks: [
          'El responsable del tratamiento de los datos personales descritos en esta política es {owner} (en adelante, «el Titular»), cuyos datos identificativos y de contacto figuran al [final de esta página](owner).',
          'Para cualquier cuestión relativa a la protección de datos, el usuario puede dirigirse a {email}.',
        ],
      },
      {
        id: 'data',
        title: 'Datos tratados',
        blocks: [
          {
            list: [
              'Datos de la cuenta: dirección de correo electrónico, nombre de usuario y contraseña, que se almacena cifrada mediante una función hash. Si el usuario se registra con Google, se reciben además el nombre, el correo electrónico y la fotografía de perfil asociados a su cuenta de Google.',
              'Contenidos: las historias, los textos y las imágenes que el usuario crea o sube al servicio.',
              'Datos de la suscripción: plan contratado, estado de la suscripción y fecha del siguiente cobro. Los datos de la tarjeta se facilitan directamente a Stripe y el Titular no tiene acceso a ellos.',
              'Datos técnicos: dirección IP, tipo de navegador y registros de acceso que generan los proveedores de alojamiento para el funcionamiento y la seguridad del servicio.',
              'Datos de uso: las páginas de trama.app que visita el usuario, el sitio desde el que llega, el navegador, el dispositivo y el país aproximado, medidos sin cookies (véase el [apartado 9](cookies)).',
              'Datos de los jugadores de las historias, únicamente cuando el autor activa el seguimiento (véase el [apartado 4](players)).',
            ],
          },
          'Los datos de la cuenta son necesarios para prestar el servicio: sin ellos no es posible registrarse ni utilizar el editor.',
        ],
      },
      {
        id: 'purposes',
        title: 'Finalidades y bases jurídicas',
        blocks: [
          {
            list: [
              'Gestionar la cuenta y prestar el servicio (editor, reproductor y publicación de historias). Base jurídica: ejecución del contrato (art. 6.1.b RGPD).',
              'Gestionar la suscripción, los cobros y la facturación. Base jurídica: ejecución del contrato y cumplimiento de las obligaciones fiscales y contables (art. 6.1.b y 6.1.c RGPD).',
              'Enviar las comunicaciones necesarias para el servicio: confirmación de la cuenta, restablecimiento de la contraseña y avisos relativos a la suscripción o a la modificación de estos textos. Base jurídica: ejecución del contrato (art. 6.1.b RGPD).',
              'Garantizar la seguridad del servicio y prevenir usos fraudulentos o abusivos. Base jurídica: interés legítimo del Titular en proteger el servicio y a sus usuarios (art. 6.1.f RGPD).',
              'Medir de forma agregada el uso del sitio web y de la aplicación para mejorarlos. Base jurídica: interés legítimo del Titular en conocer cómo se utiliza el servicio (art. 6.1.f RGPD). El usuario puede oponerse en cualquier momento escribiendo al Titular; bloquear el script de DataFast en el navegador también impide la medición.',
            ],
          },
          'El Titular no vende datos personales, no los utiliza con fines publicitarios, no elabora perfiles ni adopta decisiones automatizadas. Tampoco envía comunicaciones comerciales; si en el futuro lo hiciera, solicitaría previamente el consentimiento del usuario.',
        ],
      },
      {
        id: 'players',
        title: 'Datos de los jugadores',
        blocks: [
          'Jugar una historia no requiere registro. Si el autor de una historia activa la función de seguimiento, cada partida se registra y el autor puede consultarla. Se registran el nombre o identificador que solicite la historia (o «anónimo»), las respuestas elegidas, las escenas visitadas con su fecha y hora, y las estadísticas y condiciones con las que termina la partida.',
          'Respecto de estos datos, el autor de la historia es el responsable del tratamiento y el Titular actúa como encargado del tratamiento por cuenta de aquel, en los términos del artículo 28 del RGPD: los conserva únicamente para mostrárselos al autor y no los utiliza para ninguna otra finalidad. Corresponde al autor informar a los jugadores y contar con una base jurídica adecuada, en especial cuando los jugadores sean menores de edad.',
          'Los jugadores pueden ejercer sus derechos ante el autor de la historia. Las solicitudes que reciba el Titular se trasladarán al autor.',
        ],
      },
      {
        id: 'providers',
        title: 'Destinatarios',
        blocks: [
          'Los datos no se ceden a terceros, salvo obligación legal. Para prestar el servicio, el Titular recurre a los siguientes proveedores, que tratan los datos como encargados del tratamiento en virtud de un contrato conforme al artículo 28 del RGPD:',
          {
            list: [
              'Supabase Pte. Ltd.: base de datos, autenticación, almacenamiento de imágenes y envío de los correos de la cuenta. Los datos se alojan en servidores de la Unión Europea (París).',
              'Vercel Inc.: alojamiento del sitio web y de la aplicación.',
              'Amazon Web Services: redimensionado de las imágenes subidas, en servidores situados en Londres.',
              'JustShipIt Pte. Ltd. (DataFast): analítica del sitio web y de la aplicación, sin cookies.',
            ],
          },
          'Los siguientes proveedores tratan además determinados datos como responsables independientes, conforme a sus propias políticas de privacidad:',
          {
            list: [
              'Stripe, que procesa los pagos y gestiona las suscripciones y, como responsable, trata los datos de pago para prevenir el fraude y cumplir sus obligaciones legales ([política de privacidad de Stripe](stripe)).',
              'Google, únicamente si el usuario decide registrarse o iniciar sesión con su cuenta de Google.',
            ],
          },
          'Asimismo, los datos podrán comunicarse a las autoridades competentes cuando exista una obligación legal.',
        ],
      },
      {
        id: 'transfers',
        title: 'Transferencias internacionales',
        blocks: [
          'Algunos de estos proveedores tienen su sede o pueden tratar datos fuera del Espacio Económico Europeo: Supabase (Singapur y Estados Unidos), Vercel, Stripe y Google (Estados Unidos), Amazon Web Services (Reino Unido) y DataFast (Singapur, con servidores principalmente en Estados Unidos). Estas transferencias se amparan en las cláusulas contractuales tipo aprobadas por la Comisión Europea (en el caso de DataFast, las que aplican sus propios proveedores), en el Marco de Privacidad de Datos UE-EE. UU. para las entidades adheridas a él y, en el caso del Reino Unido, en la decisión de adecuación de la Comisión Europea.',
        ],
      },
      {
        id: 'retention',
        title: 'Plazos de conservación',
        blocks: [
          {
            list: [
              'Datos de la cuenta y contenidos: mientras la cuenta permanezca activa. Tras la solicitud de supresión, se eliminan en un plazo máximo de 30 días, salvo las copias de seguridad, que se eliminan según su ciclo de rotación.',
              'Partidas registradas: mientras exista la historia o hasta que su autor las elimine.',
              'Datos de facturación: durante los plazos que exige la normativa fiscal y mercantil, con carácter general entre cuatro y seis años.',
              'Registros técnicos: durante los plazos limitados que fijan los proveedores de alojamiento.',
              'Datos de analítica: los visitantes se cuentan con un identificador que cambia cada 24 horas, de modo que las visitas de días distintos no pueden vincularse a la misma persona; las estadísticas resultantes se conservan mientras el Titular utilice DataFast.',
            ],
          },
          'Finalizados estos plazos, los datos podrán conservarse bloqueados únicamente durante el tiempo necesario para atender posibles responsabilidades legales.',
        ],
      },
      {
        id: 'rights',
        title: 'Derechos',
        blocks: [
          'El usuario puede ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de sus datos mediante un correo electrónico a {email}, enviado desde la dirección asociada a su cuenta. El nombre de usuario puede modificarse directamente desde el perfil. Las solicitudes se atenderán en el plazo de un mes.',
          'Si considera que el tratamiento no se ajusta a la normativa, el usuario puede presentar una reclamación ante la Agencia Española de Protección de Datos ([www.aepd.es](aepd)) o ante la autoridad de control de su Estado de residencia.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies y almacenamiento local',
        blocks: [
          'Trama no utiliza cookies publicitarias ni analíticas. Para contar las visitas utiliza DataFast en su modo sin cookies: identifica a cada visitante con un código derivado de la dirección IP y del navegador que cambia cada 24 horas y, como máximo, guarda en el navegador un registro temporal que se borra al terminar la sesión de navegación. Aparte de esto, el servicio solo almacena en el navegador del usuario (localStorage) la información necesaria para su funcionamiento:',
          {
            list: [
              'la sesión iniciada;',
              'el idioma y el tema visual, claro u oscuro, elegidos por el usuario;',
              'la última historia abierta y el estado de su tablero.',
            ],
          },
          'Se trata de información técnica o de preferencias elegidas expresamente por el usuario, por lo que no requiere consentimiento (art. 22.2 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico). Durante el pago, la página de Stripe utiliza sus propias cookies para procesar la operación y prevenir el fraude; lo mismo ocurre en la página de Google al iniciar sesión con Google.',
        ],
      },
      {
        id: 'security',
        title: 'Seguridad',
        blocks: [
          'El Titular aplica medidas técnicas y organizativas adecuadas para proteger los datos: las comunicaciones se cifran mediante HTTPS, las contraseñas se almacenan cifradas y cada autor solo puede acceder a sus propias historias. Si se produjera una violación de la seguridad que afectara a datos personales, se notificaría a la autoridad de control y, cuando proceda, a los afectados, conforme a los artículos 33 y 34 del RGPD.',
        ],
      },
      {
        id: 'changes',
        title: 'Modificaciones',
        blocks: [
          'El Titular podrá modificar esta política para adaptarla a cambios normativos o del servicio. Los cambios relevantes se comunicarán por correo electrónico o en la aplicación antes de su entrada en vigor. La fecha de la última actualización figura al principio de este documento.',
        ],
      },
    ],
  },
  terms: {
    meta: {
      title: 'Condiciones de servicio — Trama',
      description:
        'Condiciones de uso y contratación de Trama: cuenta, suscripción, cancelación y desistimiento, contenidos del usuario, uso aceptable y responsabilidad.',
    },
    title: 'Condiciones de servicio',
    intro:
      'Estas Condiciones de servicio regulan el acceso a trama.app y su uso. La creación de una cuenta implica su aceptación íntegra, por lo que se recomienda leerlas con atención.',
    sections: [
      {
        id: 'provider',
        title: 'Titular del servicio',
        blocks: [
          'El sitio web y la aplicación disponibles en trama.app (en adelante, «Trama» o «el Servicio») son titularidad de {owner}, cuyos datos identificativos figuran al [final de esta página](owner).',
          'En estas condiciones, «el Titular» designa a dicha persona y «el Usuario», a toda persona que utilice el Servicio.',
        ],
      },
      {
        id: 'service',
        title: 'Objeto',
        blocks: [
          'Trama es una herramienta en línea para escribir historias interactivas ramificadas sobre un tablero, probarlas y compartirlas mediante un enlace para que otras personas las jueguen. Jugar una historia compartida es gratuito y no requiere cuenta. La creación de historias requiere una cuenta y una suscripción de pago; los planes y sus precios se detallan en la [página de precios](pricing).',
        ],
      },
      {
        id: 'account',
        title: 'Registro y cuenta',
        blocks: [
          {
            list: [
              'El Usuario debe facilitar datos veraces y mantener actualizada su dirección de correo electrónico, que es el medio de comunicación con el Titular.',
              'El Usuario es responsable de custodiar su contraseña y del uso que se haga de su cuenta, y debe comunicar al Titular cualquier uso no autorizado del que tenga conocimiento.',
              'Los menores de edad necesitan la autorización de sus padres o tutores legales para registrarse.',
            ],
          },
        ],
      },
      {
        id: 'payment',
        title: 'Planes, precios y pago',
        blocks: [
          {
            list: [
              'Los precios se indican en euros en la [página de precios](pricing) e incluyen el IVA.',
              'Las suscripciones son mensuales o anuales y se abonan por adelantado con tarjeta a través de Stripe. Se renuevan automáticamente al final de cada periodo, por la misma duración y al precio vigente, salvo cancelación previa.',
              'El Usuario puede cancelar la suscripción en cualquier momento desde su perfil. La cancelación impide la siguiente renovación: el Usuario conserva el acceso a las funciones de pago hasta el final del periodo abonado y no se realizan nuevos cobros. El periodo en curso no se reembolsa, salvo en los supuestos de la cláusula siguiente o cuando lo exija la ley.',
              'Cualquier cambio de precio se comunicará con al menos 30 días de antelación y se aplicará a partir de la siguiente renovación. El Usuario que no lo acepte podrá cancelar la suscripción antes de esa fecha.',
              'Si un cobro no puede realizarse, el Titular podrá suspender las funciones de pago hasta que se regularice.',
            ],
          },
        ],
      },
      {
        id: 'withdrawal',
        title: 'Derecho de desistimiento',
        blocks: [
          'El Usuario que tenga la condición de consumidor dispone de 14 días naturales desde la contratación para desistir de la suscripción, sin necesidad de justificación, mediante una declaración inequívoca enviada a {email}. Puede utilizar el siguiente modelo, aunque no es obligatorio:',
          '«Por la presente le comunico que desisto de mi contrato de suscripción a Trama. Fecha de contratación: [fecha]. Nombre: [nombre]. Correo electrónico de la cuenta: [correo]. Fecha: [fecha].»',
          'El Titular reembolsará el importe abonado en un plazo máximo de 14 días desde la recepción de la declaración, por el mismo medio de pago utilizado. Si el Usuario hubiera solicitado expresamente que el Servicio comenzara durante el plazo de desistimiento, se descontará el importe proporcional a la parte del Servicio ya prestada.',
        ],
      },
      {
        id: 'content',
        title: 'Contenidos del Usuario',
        blocks: [
          {
            list: [
              'El Usuario conserva todos los derechos sobre las historias y las imágenes que crea o sube. El Titular no adquiere ninguna titularidad sobre ellas.',
              'El Usuario concede al Titular una licencia gratuita, no exclusiva y limitada a lo necesario para prestar el Servicio: almacenar los contenidos, procesarlos (por ejemplo, redimensionar las imágenes) y mostrarlos a las personas con las que el Usuario los comparta. La licencia se extingue cuando el Usuario elimina los contenidos o su cuenta, salvo respecto de las copias de seguridad hasta su eliminación.',
              'El Usuario es el único responsable de los contenidos que publica y garantiza que dispone de los derechos necesarios sobre ellos, incluidos textos, imágenes y personajes.',
              'Al activar el seguimiento en una historia, el Usuario encarga al Titular el registro de sus partidas. El [apartado 4 de la Política de privacidad](players) describe este tratamiento y constituye el contrato de encargo del tratamiento previsto en el artículo 28 del RGPD.',
              'El Titular realiza copias de seguridad, pero no puede garantizar la ausencia de pérdidas de datos. Se recomienda al Usuario conservar una copia de sus contenidos importantes.',
            ],
          },
        ],
      },
      {
        id: 'use',
        title: 'Uso aceptable',
        blocks: [
          'El Usuario se compromete a no utilizar el Servicio para:',
          {
            list: [
              'publicar contenidos ilícitos o que vulneren derechos de terceros, como los de propiedad intelectual, la intimidad o la propia imagen;',
              'acosar o amenazar a otras personas, incitar al odio o a la violencia, o difundir contenidos sexuales que involucren a menores;',
              'distribuir software malicioso, comunicaciones no solicitadas o contenidos engañosos, como el phishing;',
              'atacar o sobrecargar el Servicio, acceder sin autorización al Servicio o a cuentas ajenas, o extraer contenidos de forma masiva;',
              'revender el acceso al Servicio.',
            ],
          },
          'Cualquier persona puede notificar contenidos presuntamente ilícitos alojados en Trama escribiendo a {email}, con indicación de su ubicación y de los motivos. El Titular podrá retirar los contenidos o suspender las cuentas que incumplan estas condiciones, informando al Usuario de los motivos cuando sea posible. En casos graves, podrá cerrar la cuenta sin previo aviso.',
        ],
      },
      {
        id: 'property',
        title: 'Propiedad intelectual e industrial',
        blocks: [
          'La aplicación, su diseño, el nombre y el logotipo de Trama y la historia de ejemplo incluida en las cuentas nuevas pertenecen al Titular. El Usuario puede editar la historia de ejemplo y utilizarla como base para sus propias historias. El motor de historias (@trama-app/engine) se distribuye como código abierto con licencia MIT. Fuera de estos supuestos, el uso del Servicio no otorga al Usuario ningún derecho sobre dichos elementos.',
        ],
      },
      {
        id: 'availability',
        title: 'Disponibilidad y modificaciones del Servicio',
        blocks: [
          'El Titular procurará mantener el Servicio disponible y los contenidos a salvo, pero no garantiza su funcionamiento ininterrumpido: pueden producirse interrupciones por mantenimiento, errores técnicos o causas ajenas a su control. El Titular podrá mejorar, modificar o retirar funcionalidades. Si una modificación suprime una prestación esencial del plan contratado, se comunicará con antelación y el Usuario podrá cancelar la suscripción con el reembolso de la parte no disfrutada.',
        ],
      },
      {
        id: 'liability',
        title: 'Responsabilidad',
        blocks: [
          'El Servicio se presta en el estado en que se encuentra. El Titular responde de los daños causados por dolo o culpa grave y en los demás casos en que la ley no permita excluir su responsabilidad. Cuando el Usuario no tenga la condición de consumidor, la responsabilidad del Titular se limita al importe abonado por el Usuario en los 12 meses anteriores al hecho causante y excluye los daños indirectos, como el lucro cesante. Nada de lo dispuesto en estas condiciones limita los derechos que la normativa de protección de los consumidores reconoce al Usuario.',
        ],
      },
      {
        id: 'termination',
        title: 'Baja y resolución',
        blocks: [
          'El Usuario puede dejar de utilizar el Servicio en cualquier momento, cancelando la suscripción desde su perfil y solicitando la eliminación de su cuenta a {email}. Los contenidos y los datos se eliminarán conforme a la [Política de privacidad](privacy). El Titular podrá resolver el contrato y cerrar la cuenta en caso de incumplimiento grave o reiterado de estas condiciones.',
        ],
      },
      {
        id: 'changes',
        title: 'Modificación de las condiciones',
        blocks: [
          'El Titular podrá modificar estas condiciones por motivos justificados, como cambios normativos, técnicos o del Servicio. Las modificaciones se comunicarán por correo electrónico o en la aplicación con al menos 15 días de antelación a su entrada en vigor. El Usuario que no las acepte podrá cancelar la suscripción antes de esa fecha; el uso continuado del Servicio tras su entrada en vigor implica su aceptación.',
        ],
      },
      {
        id: 'law',
        title: 'Legislación aplicable y jurisdicción',
        blocks: [
          'Estas condiciones se rigen por la legislación española. Cuando el Usuario sea consumidor, serán competentes los juzgados y tribunales de su domicilio, y conservará la protección que le otorguen las normas imperativas de su país de residencia. Antes de acudir a la vía judicial, el Usuario puede dirigir su reclamación a {email} para buscar una solución amistosa, o acudir al Sistema Arbitral de Consumo o a los servicios de consumo de su comunidad autónoma.',
        ],
      },
    ],
  },
}
