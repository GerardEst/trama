import type { PricingCopy } from './en'

export const pricing: PricingCopy = {
  meta: {
    title: 'Precios — Trama',
    description:
      'Creative, todo el editor de Trama, es gratuito. Pro añadirá las analíticas de las historias publicadas y llegará pronto.',
  },
  eyebrow: 'Precios',
  titleStart: 'Todo el editor',
  titleEnd: 'gratis.',
  lead: 'Creative tiene todas las herramientas para escribir, probar y publicar historias interactivas, y no cuesta nada. Pro añadirá las analíticas de las historias que publicas, para marcas que necesitan saber cómo se juegan.',
  billing: { label: 'Periodo de facturación', monthly: 'Mensual', yearly: 'Anual' },
  perMonth: 'al mes',
  perYear: 'al año',
  wasLabel: 'Doce mensualidades:',
  nowLabel: 'pagando el año:',
  free: 'Gratis',
  plans: {
    creative: {
      audience: 'Para quien escribe',
      lead: 'Todas las herramientas para escribir una historia con ramas, probarla y compartirla con un enlace.',
      cta: 'Empieza gratis',
      ctaNote: 'Sin tarjeta y sin periodo de prueba: crea una cuenta y escribe.',
      includes: 'Todo el editor, sin nada bloqueado:',
    },
    pro: {
      audience: 'Para marcas',
      lead: 'Todo lo que incluye Creative y, además, los datos: cada partida de las historias que publicas.',
      soon: 'Próximamente',
      ctaNote: 'Mientras tanto, Creative ya incluye todo el editor, gratis.',
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
  engine: {
    eyebrow: 'Gratis, sea cual sea el plan',
    title: 'Trama Engine es gratuito y de código abierto',
    body: 'El motor que juega todas las historias de Trama tiene licencia MIT y no cuesta nada. Úsalo para jugar tus historias en cualquier interfaz que construyas: en tu web, en un juego o en un chat. Sea cual sea tu plan, la historia que crees es tuya.',
    more: 'Cómo funciona',
  },
  faqTitle: 'Antes de elegir.',
  faq: [
    {
      question: '¿Creative es gratis de verdad?',
      answer: 'Sí. Creative incluye todo el editor y no cuesta nada. No necesitas tarjeta y no hay ningún periodo de prueba que se acabe.',
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
      question: '¿Cuánto costará Pro?',
      answer: 'Pro costará {proMonthly} al mes o {proYearly} al año, menos que doce mensualidades. El pago se procesará con Stripe.',
    },
    {
      question: '¿Cuándo podré contratar Pro?',
      answer: 'Pronto. Pro todavía no está a la venta. Mientras tanto, Creative ya incluye todo el editor, gratis.',
    },
    {
      question: '¿Trama Engine es de pago?',
      answer: 'No. El motor es gratuito y de código abierto con licencia MIT.',
    },
  ],
}
