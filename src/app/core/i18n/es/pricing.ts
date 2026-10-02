import type { Dictionary } from '../i18n.types'

export const pricing: Dictionary['pricing'] = {
  billing: {
    label: 'Periodo de facturación',
    monthly: 'Facturación mensual',
    annual: 'Facturación anual',
    save: 'Ahorra un 30%',
  },
  perMonth: '{price} €/mes',
  perYear: '{price} €/año',
  currentPlan: 'Tu plan actual',
  canceledPlan:
    'Tu plan actual está cancelado; puedes disfrutarlo hasta el final de este periodo',
  cancel: 'Cancelar suscripción',
  cancelFailed: 'No se ha podido cancelar la suscripción',
  successIcon: 'Icono de confirmación',
  starIcon: 'Icono de estrella',
  basic: {
    price: 'Gratis',
    compact: 'Crea y comparte hasta 3 historias. Gratis y sin datos de pago.',
    description:
      'Crea y comparte tus primeras historias ramificadas, sin datos de pago.',
    included: 'Qué incluye Basic',
    nodes: 'Todos los tipos de nodos',
    flow: 'Control total del flujo',
    interpolations: 'Interpolación de texto',
    customization: 'Opciones básicas de personalización',
    stories: 'Hasta 3 historias',
    images: 'Imágenes limitadas',
    brand: 'Marca de Trama en las historias',
    start: 'Empieza con Basic',
  },
  creator: {
    description:
      'Más espacio para crear: historias e imágenes ilimitadas, y control sobre cómo compartes.',
    included: 'Qué incluye Creator',
    everything: 'Todo lo de Basic, y además:',
    stories: 'Historias ilimitadas',
    images: 'Imágenes ilimitadas',
    brand: 'Personaliza la marca en las historias',
    sharing: 'Opciones para compartir y enlaces externos',
    choose: 'Elige Creator',
  },
  pro: {
    inDevelopment: 'En desarrollo',
    description:
      'Herramientas previstas para entender a tus lectores. Estas funciones aún no están disponibles.',
    planned: 'Previsto para Pro:',
    analytics: 'Analíticas de tus historias',
    tracking: 'Seguimiento de las acciones de los usuarios',
    embed: 'Inserta historias en tu web',
    support: 'Soporte prioritario',
    comingSoon: 'Próximamente',
  },
}
