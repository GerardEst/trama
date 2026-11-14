import type { PricingCopy } from './en'

export const pricing: PricingCopy = {
  meta: {
    title: 'Precios — Trama',
    description:
      'Trama tiene dos planes y ninguno gratuito. Creative incluye todo el editor por {monthly} al mes o {yearly} al año. Pro añade las analíticas de las historias publicadas.',
  },
  eyebrow: 'Precios',
  titleStart: 'Todo el editor',
  titleEnd: 'por {price} al mes.',
  lead: 'Creative tiene todas las herramientas para escribir, probar y publicar historias interactivas. Pro añade las analíticas de las historias que publicas, para marcas que necesitan saber cómo se juegan.',
  billing: { label: 'Periodo de facturación', monthly: 'Mensual', yearly: 'Anual' },
  perMonth: 'al mes',
  perYear: 'al año',
  orYearly: 'o {price} al año',
  yearlyDetail: '{price} al mes · {saving} menos que pagando mes a mes',
  plans: {
    creative: {
      audience: 'Para quien escribe',
      lead: 'Todas las herramientas para escribir una historia con ramas, probarla y compartirla con un enlace.',
      cta: 'Empieza con Creative',
      ctaNote: 'Cancela cuando quieras, desde tu perfil.',
      includes: 'Todo el editor, sin nada bloqueado:',
    },
    pro: {
      audience: 'Para marcas',
      lead: 'Todo lo que incluye Creative y, además, los datos: cada partida de las historias que publicas.',
      soon: 'Próximamente',
      ctaNote: 'Mientras tanto, Creative ya incluye todo el editor.',
      includes: 'Todo lo que incluye Creative, y además:',
      analytics: [
        {
          title: 'Cada partida, registrada',
          body: 'Activa el seguimiento de una historia y cada partida aparece en una tabla, con el nombre del jugador y la fecha.',
        },
        {
          title: 'Qué ha elegido cada lector',
          body: 'Cada fila muestra las estadísticas y las condiciones con las que ha terminado la partida, y así ves qué caminos elige tu público.',
        },
      ],
    },
  },
  sample: { caption: 'Todas las respuestas', name: 'Nombre', date: 'Fecha' },
  always: {
    title: 'Incluido en los dos planes',
    items: [
      { title: 'Los lectores nunca pagan', body: 'Abren tu enlace y juegan. Sin cuenta y sin instalar nada.' },
      { title: 'El motor es abierto', body: 'Trama Engine es gratuito y tiene licencia MIT: juega tus historias en cualquier interfaz que construyas.' },
      { title: 'Las palabras son tuyas', body: 'Trama no genera el texto, y puedes descargar cualquier historia en JSON.' },
    ],
  },
  faqTitle: 'Antes de elegir.',
  faq: [
    {
      question: '¿Hay un plan gratuito o un periodo de prueba?',
      answer: 'No. Trama es de pago desde el primer día: Creative cuesta {creativeMonthly} al mes e incluye todo el editor. Antes de pagar puedes jugar una historia entera y usar el editor real en la página de inicio, sin cuenta.',
    },
    {
      question: '¿Qué añade Pro?',
      answer: 'Las analíticas de las historias publicadas: cada partida en una tabla, con el nombre del jugador, la fecha y las estadísticas y condiciones con las que ha terminado. Todo lo demás es igual que en Creative.',
    },
    {
      question: '¿Mis lectores tienen que pagar o registrarse?',
      answer: 'No. Los lectores abren el enlace y juegan, con cualquiera de los dos planes.',
    },
    {
      question: '¿Puedo pagar por años?',
      answer: 'Sí. Creative cuesta {creativeYearly} al año y Pro {proYearly} al año, menos que doce mensualidades. El pago se procesa con Stripe.',
    },
    {
      question: '¿Puedo cancelar la suscripción?',
      answer: 'Sí, cuando quieras. La cancelas tú mismo, desde tu perfil.',
    },
    {
      question: '¿Cuándo podré contratar Pro?',
      answer: 'Pronto. Pro todavía no está a la venta. Mientras tanto, Creative ya incluye todo el editor.',
    },
    {
      question: '¿Trama Engine es de pago?',
      answer: 'No. El motor es gratuito y de código abierto con licencia MIT. El plan paga el editor donde escribes las historias, no el código que las juega.',
    },
  ],
}
