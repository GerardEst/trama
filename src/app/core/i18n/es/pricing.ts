import type { Dictionary } from '../i18n.types'

export const pricing: Dictionary['pricing'] = {
  billing: {
    label: 'Periodo de facturación de Creator',
    monthly: 'Facturación mensual',
    annual: 'Facturación anual',
    save: 'Ahorra un 30%',
  },
  perMonth: '{price} €/mes',
  perYear: '{price} €/año',
  currentPlan: 'Tu plan actual',
  canceledPlan: 'Suscripción cancelada',
  cancel: 'Cancelar suscripción',
  cancelFailed: 'No se ha podido cancelar la suscripción',
  successIcon: 'Incluido',
  legacyPro: 'Tienes una suscripción Pro antigua. Es independiente del futuro Pro de pago único y no se ha migrado automáticamente.',
  creator: {
    description: 'Escribe, prueba y comparte con todas las funciones actuales del editor incluidas. Suscripción mensual o anual.',
    included: 'Qué incluye Creator',
    everything: 'Sin bloqueos de funciones en el editor:',
    stories: 'Crea y organiza historias ramificadas',
    images: 'Añade imágenes a las escenas',
    brand: 'Personaliza la marca y el pie de la historia',
    sharing: 'Enlaces de lectura, botones para compartir y enlaces externos',
    analytics: 'Seguimiento de jugadores y analíticas de la historia',
    data: 'Descarga los datos de la historia en JSON',
    choose: 'Elige Creator',
  },
  pro: {
    referencePrice: 'Unos {price} €',
    oneTime: 'Pago único · previsto',
    description: 'Un futuro pago único con exportación de historias. Aún no se puede comprar.',
    export: 'Exportación jugable prevista, aún no implementada',
    format: 'El formato y el alcance de la exportación aún están por decidir',
    priceNote: 'Precio orientativo, no es una oferta definitiva. No se cobra ningún pago por Pro.',
    comingSoon: 'Pro aún no está disponible',
  },
}
