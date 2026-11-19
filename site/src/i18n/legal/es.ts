import type { LegalCopy } from './en'

export const legal: LegalCopy = {
  back: 'Volver a Trama',
  updated: 'Última actualización: {date}',
  contents: 'Contenido',
  owner: { name: 'Titular', nif: 'NIF', email: 'Correo electrónico', address: 'Domicilio' },
  privacy: {
    meta: {
      title: 'Política de privacidad — Trama',
      description:
        'Qué datos personales trata Trama, para qué, qué proveedores nos ayudan y cómo ejercer tus derechos. Sin cookies de publicidad ni de analítica.',
    },
    title: 'Política de privacidad',
    intro:
      'Qué datos personales trata Trama, para qué, quién más los trata y cómo los controlas. Solo recogemos lo que el servicio necesita para funcionar.',
    sections: [
      {
        id: 'controller',
        title: 'Quién es el responsable',
        blocks: [
          'Trama (trama.app) la gestiona la persona que figura a continuación, responsable del tratamiento de los datos personales que describe esta política:',
          { owner: true },
          'Para cualquier cuestión sobre tus datos, escribe a {email}.',
        ],
      },
      {
        id: 'data',
        title: 'Qué datos tratamos',
        blocks: [
          {
            list: [
              'Cuenta: tu correo electrónico, tu nombre de usuario y tu contraseña, que guardamos cifrada y nunca en texto plano. Si entras con Google, Google nos comparte tu nombre, tu correo y tu foto de perfil.',
              'Tus historias: todo lo que escribes en el editor y las imágenes que subes.',
              'Suscripción: tu plan, su estado y la fecha del próximo pago. Los datos de tu tarjeta los introduces en Stripe y nunca nos llegan.',
              'Datos técnicos: la dirección IP, el navegador y los registros de acceso que guardan nuestros proveedores para hacer funcionar y proteger el servicio.',
              'Datos de quienes juegan tus historias, solo si activas el seguimiento (ver [apartado 4](players)).',
            ],
          },
        ],
      },
      {
        id: 'purposes',
        title: 'Para qué los usamos y con qué base legal',
        blocks: [
          {
            list: [
              'Para crear tu cuenta y ofrecerte el editor, el playground y la opción de compartir historias. Es necesario para cumplir el contrato contigo (art. 6.1.b RGPD).',
              'Para cobrar la suscripción y conservar las facturas, para cumplir el contrato y la normativa fiscal (art. 6.1.b y 6.1.c).',
              'Para enviarte los correos que el servicio necesita: confirmar tu cuenta, restablecer la contraseña y avisos sobre tu suscripción o sobre cambios en estos textos (art. 6.1.b).',
              'Para mantener el servicio seguro y evitar abusos, que es nuestro interés legítimo (art. 6.1.f).',
            ],
          },
          'No vendemos tus datos, no los usamos para publicidad y no tomamos decisiones automatizadas sobre ti. Trama no tiene newsletter; si algún día la añadimos, primero te pedirá el consentimiento.',
        ],
      },
      {
        id: 'players',
        title: 'Datos de quienes juegan tus historias',
        blocks: [
          'Jugar una historia no requiere cuenta. Si su autor activa el seguimiento, cada partida se guarda y el autor la puede ver: el nombre o identificador que pida la historia (o «anónimo»), las respuestas elegidas, las escenas visitadas y cuándo, y las estadísticas y condiciones con las que terminó la partida.',
          'De esos datos, el responsable es el autor y Trama es el encargado del tratamiento, que actúa por cuenta suya (art. 28 RGPD): solo los guardamos para mostrárselos al autor y no los usamos para nada más. El autor que activa el seguimiento debe informar a los jugadores y tener una base legal para hacerlo, con especial cuidado si los jugadores son menores.',
          'Los jugadores que quieran ejercer sus derechos deben dirigirse al autor de la historia. Si nos escriben a nosotros, le haremos llegar la petición.',
        ],
      },
      {
        id: 'providers',
        title: 'Quién más los trata',
        blocks: [
          'Nos apoyamos en estos proveedores, que tratan los datos solo por cuenta nuestra y con un contrato de encargo del tratamiento:',
          {
            list: [
              'Supabase: base de datos, cuentas, almacenamiento de imágenes y correos de la cuenta. Servidores en la Unión Europea (París).',
              'Vercel: alojamiento de la web y de la aplicación.',
              'Stripe: pagos y suscripciones.',
              'Amazon Web Services: redimensionar las imágenes que subes. Servidores en Londres.',
              'Google: solo si decides entrar con tu cuenta de Google.',
            ],
          },
          'También comunicaremos datos a las autoridades cuando la ley lo exija.',
        ],
      },
      {
        id: 'transfers',
        title: 'Transferencias fuera de la Unión Europea',
        blocks: [
          'Vercel, Stripe y Google tienen sede en Estados Unidos o pueden tratar datos allí, y AWS redimensiona las imágenes en el Reino Unido. Estas transferencias están amparadas por el Marco de Privacidad de Datos UE-EE. UU., por las cláusulas contractuales tipo de la Comisión Europea o, en el caso del Reino Unido, por una decisión de adecuación.',
        ],
      },
      {
        id: 'retention',
        title: 'Cuánto tiempo los conservamos',
        blocks: [
          {
            list: [
              'Cuenta e historias: mientras tu cuenta esté abierta. Cuando nos pidas eliminarla, las borraremos en un plazo de 30 días; las copias de seguridad desaparecen a medida que caducan.',
              'Partidas: mientras exista la historia o hasta que su autor las borre.',
              'Datos de facturación: el tiempo que exigen las leyes fiscales y mercantiles, en general entre cuatro y seis años.',
              'Registros técnicos: los plazos cortos que fijan nuestros proveedores.',
            ],
          },
        ],
      },
      {
        id: 'rights',
        title: 'Tus derechos',
        blocks: [
          'Puedes pedir acceder a tus datos, rectificarlos, suprimirlos, limitar u oponerte a su tratamiento y recibir una copia en un formato reutilizable (portabilidad). Tu nombre de usuario lo puedes cambiar en tu perfil; para todo lo demás, incluido eliminar tu cuenta, escribe a {email} desde el correo de tu cuenta. Te responderemos en el plazo de un mes.',
          'Si crees que no hemos tratado bien tus datos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos ([aepd.es](aepd)) o ante la autoridad de tu país.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies y almacenamiento local',
        blocks: [
          'Trama no usa cookies de publicidad ni de analítica, ni rastreo de terceros. En tu navegador (localStorage) solo guarda lo que necesita para funcionar:',
          {
            list: [
              'Tu sesión, para que no tengas que volver a entrar.',
              'Tu idioma y tu tema claro u oscuro.',
              'La última historia que abriste y cómo dejaste su tablero.',
            ],
          },
          'Todo ello es estrictamente necesario o recuerda una elección tuya, así que no requiere consentimiento. Cuando pagas, la página de Stripe usa sus propias cookies para procesar el pago y prevenir el fraude, como explica la [política de privacidad de Stripe](stripe). Entrar con Google hace lo mismo en la página de Google.',
        ],
      },
      {
        id: 'security',
        title: 'Seguridad',
        blocks: [
          'Las conexiones van cifradas (HTTPS), las contraseñas se guardan cifradas y cada autor solo puede acceder a sus propias historias. Ningún sistema es completamente seguro: si una brecha afectara a tus datos, te avisaríamos a ti y a la autoridad tal como exige la ley.',
        ],
      },
      {
        id: 'changes',
        title: 'Cambios en esta política',
        blocks: [
          'Si cambiamos esta política en algo importante, te avisaremos por correo o en la aplicación antes de que se aplique. La fecha de arriba indica la versión vigente.',
        ],
      },
    ],
  },
  terms: {
    meta: {
      title: 'Condiciones de servicio — Trama',
      description:
        'Las condiciones para usar Trama: cuentas, suscripciones y cancelación, tus derechos sobre tus historias, uso aceptable y responsabilidad.',
    },
    title: 'Condiciones de servicio',
    intro:
      'El acuerdo entre tú y Trama cuando usas trama.app. Al crear una cuenta aceptas estas condiciones, así que te pedimos que las leas.',
    sections: [
      {
        id: 'provider',
        title: 'Quién presta el servicio',
        blocks: [
          'Estas condiciones regulan el uso de la web y la aplicación de trama.app («Trama» o «el servicio»), que presta:',
          { owner: true },
        ],
      },
      {
        id: 'service',
        title: 'El servicio',
        blocks: [
          'Trama es una herramienta en línea para escribir historias interactivas ramificadas en un tablero, probarlas y compartirlas con un enlace para que otros las jueguen. Jugar una historia compartida es gratis y no requiere cuenta. Para escribir historias hace falta una cuenta y una suscripción; la [página de precios](pricing) describe cada plan y su precio.',
        ],
      },
      {
        id: 'account',
        title: 'Tu cuenta',
        blocks: [
          {
            list: [
              'Da datos verdaderos y mantén tu correo al día: es como contactamos contigo.',
              'Guarda bien tu contraseña. Eres responsable de lo que se haga con tu cuenta; avísanos si crees que otra persona la está usando.',
              'Si eres menor de edad, necesitas el permiso de tus padres o tutores legales.',
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
              'Los precios se muestran en euros en la [página de precios](pricing), con el IVA incluido.',
              'Las suscripciones son mensuales o anuales y se pagan por adelantado con tarjeta a través de Stripe. Se renuevan automáticamente al final de cada periodo, por la misma duración y al precio vigente, hasta que canceles.',
              'Puedes cancelar cuando quieras desde tu perfil. Cancelar detiene la renovación: conservas las funciones de pago hasta el final del periodo que ya has pagado y no se te volverá a cobrar. Ese periodo no se reembolsa, salvo lo que dice el apartado siguiente o cuando la ley lo exija.',
              'Si cambiamos un precio, te avisaremos con al menos 30 días de antelación. El nuevo precio se aplica a partir de tu próxima renovación y puedes cancelar antes.',
              'Si no se puede cobrar un pago, podemos suspender las funciones de pago hasta que se resuelva.',
            ],
          },
        ],
      },
      {
        id: 'withdrawal',
        title: 'Derecho de desistimiento',
        blocks: [
          'Si eres consumidor en la Unión Europea, puedes desistir en los 14 días siguientes a la suscripción, sin dar ningún motivo, escribiendo a {email}. Como el servicio empieza enseguida, al suscribirte nos pides que te lo prestemos durante esos 14 días; si desistes, te devolveremos lo que pagaste menos la parte de los días en que ya has tenido el servicio.',
        ],
      },
      {
        id: 'content',
        title: 'Tus historias',
        blocks: [
          {
            list: [
              'Lo que escribes es tuyo. Trama no reclama ninguna propiedad sobre tus historias ni tus imágenes.',
              'Nos das una licencia gratuita y no exclusiva, limitada a lo que necesita el servicio: guardar tus historias, procesarlas (por ejemplo, redimensionar tus imágenes) y mostrarlas a quien las compartas. Termina cuando las borras o borras tu cuenta, salvo las copias de seguridad hasta que caduquen.',
              'Eres responsable de lo que publicas y garantizas que tienes los derechos: textos, imágenes, personajes y cualquier otra cosa que incluyas.',
              'Si activas el seguimiento en una historia, nos pides que registremos sus partidas por cuenta tuya. El apartado 4 de la [política de privacidad](players) describe ese tratamiento y es nuestro contrato de encargo del tratamiento según el artículo 28 del RGPD.',
              'Hacemos copias de seguridad, pero no podemos descartar cualquier pérdida: guarda tu propia copia de lo que sea importante.',
            ],
          },
        ],
      },
      {
        id: 'use',
        title: 'Uso aceptable',
        blocks: [
          'No uses Trama para:',
          {
            list: [
              'publicar contenido ilegal o que vulnere derechos de otros, como la propiedad intelectual, la intimidad o la propia imagen;',
              'acosar o amenazar a nadie, incitar al odio o a la violencia, o publicar contenido sexual que involucre a menores;',
              'difundir malware, spam o contenido engañoso como el phishing;',
              'atacar o sobrecargar el servicio, acceder a él o a cuentas ajenas sin permiso, o extraer su contenido de forma masiva;',
              'revender el acceso al servicio.',
            ],
          },
          'Para denunciar un contenido alojado en Trama, escribe a {email} indicando dónde está y por qué. Si encontramos contenidos o conductas así, podemos retirar el contenido o suspender la cuenta, explicándote el motivo cuando sea posible. En casos graves, podemos cerrar la cuenta sin previo aviso.',
        ],
      },
      {
        id: 'property',
        title: 'Propiedad intelectual de Trama',
        blocks: [
          'La aplicación, su diseño, el nombre y el logotipo de Trama y la historia de ejemplo con la que empiezan las cuentas nuevas pertenecen a su titular. Puedes editar la historia de ejemplo y usarla como base para las tuyas. El motor de historias (@trama-app/engine) es código abierto con licencia MIT. Usar Trama no te da ningún otro derecho sobre ella más allá de usarla como describen estas condiciones.',
        ],
      },
      {
        id: 'availability',
        title: 'Disponibilidad y cambios en el servicio',
        blocks: [
          'Trabajamos para que Trama esté disponible y tus historias seguras, pero no podemos prometer que nunca falle: puede haber interrupciones por mantenimiento, errores o causas ajenas a nosotros. Podemos mejorar, cambiar o retirar funciones. Si un cambio elimina algo esencial de tu plan de pago, te avisaremos con antelación y podrás cancelar con el reembolso de la parte no usada.',
        ],
      },
      {
        id: 'liability',
        title: 'Responsabilidad',
        blocks: [
          'Trama se ofrece tal como es. Respondemos de los daños que causemos con dolo o negligencia grave y de todo aquello que la ley no nos permita excluir. Fuera de eso, nuestra responsabilidad se limita a lo que hayas pagado en los 12 meses anteriores al incidente, y no respondemos de pérdidas indirectas como el lucro cesante. Nada de estas condiciones limita tus derechos como consumidor.',
        ],
      },
      {
        id: 'termination',
        title: 'Cerrar tu cuenta',
        blocks: [
          'Puedes dejar de usar Trama cuando quieras: cancela la suscripción desde tu perfil y pídenos que eliminemos tu cuenta en {email}. Borraremos tus historias y tus datos como describe la [política de privacidad](privacy). Podemos cerrar las cuentas que incumplan estas condiciones de forma grave o reiterada.',
        ],
      },
      {
        id: 'changes',
        title: 'Cambios en estas condiciones',
        blocks: [
          'Si cambiamos estas condiciones, te avisaremos por correo o en la aplicación al menos 15 días antes de que se apliquen. Si no estás de acuerdo, puedes cancelar antes; si sigues usando Trama, aceptas las nuevas condiciones.',
        ],
      },
      {
        id: 'law',
        title: 'Ley aplicable y conflictos',
        blocks: [
          'Estas condiciones se rigen por la ley española. Si eres consumidor, puedes acudir a los tribunales del lugar donde vives y conservas la protección de las leyes imperativas de tu país. Antes, escríbenos a {email} e intentaremos resolver el problema. También puedes acudir al sistema arbitral de consumo o a la oficina de consumo de tu localidad.',
        ],
      },
    ],
  },
}
