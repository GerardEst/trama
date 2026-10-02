import type { Dictionary } from '../i18n.types'

export const pricing: Dictionary['pricing'] = {
  billing: {
    label: 'Període de facturació',
    monthly: 'Facturació mensual',
    annual: 'Facturació anual',
    save: 'Estalvia un 30%',
  },
  perMonth: '{price} €/mes',
  perYear: '{price} €/any',
  currentPlan: 'El teu pla actual',
  canceledPlan:
    'El teu pla actual està cancel·lat; el pots gaudir fins al final d’aquest període',
  cancel: 'Cancel·la la subscripció',
  cancelFailed: 'No s’ha pogut cancel·lar la subscripció',
  successIcon: 'Icona de confirmació',
  starIcon: 'Icona d’estrella',
  basic: {
    price: 'Gratis',
    compact:
      'Crea i comparteix fins a 3 històries. Gratis i sense dades de pagament.',
    description:
      'Crea i comparteix les teves primeres històries amb branques, sense dades de pagament.',
    included: 'Què inclou Basic',
    nodes: 'Tots els tipus de nodes',
    flow: 'Control total del flux',
    interpolations: 'Interpolació de text',
    customization: 'Opcions bàsiques de personalització',
    stories: 'Fins a 3 històries',
    images: 'Imatges limitades',
    brand: 'Marca de Trama a les històries',
    start: 'Comença amb Basic',
  },
  creator: {
    description:
      'Més espai per crear: històries i imatges il·limitades, i control sobre com comparteixes.',
    included: 'Què inclou Creator',
    everything: 'Tot el de Basic, i a més:',
    stories: 'Històries il·limitades',
    images: 'Imatges il·limitades',
    brand: 'Personalitza la marca a les històries',
    sharing: 'Opcions per compartir i enllaços externs',
    choose: 'Tria Creator',
  },
  pro: {
    inDevelopment: 'En desenvolupament',
    description:
      'Eines previstes per entendre els teus lectors. Aquestes funcions encara no estan disponibles.',
    planned: 'Previst per a Pro:',
    analytics: 'Analítiques de les teves històries',
    tracking: 'Seguiment de les accions dels usuaris',
    embed: 'Insereix històries al teu web',
    support: 'Suport prioritari',
    comingSoon: 'Aviat',
  },
}
