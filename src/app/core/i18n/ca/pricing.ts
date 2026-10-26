import type { Dictionary } from '../i18n.types'

export const pricing: Dictionary['pricing'] = {
  billing: {
    label: 'Període de facturació de Creator',
    monthly: 'Facturació mensual',
    annual: 'Facturació anual',
    save: 'Estalvia un 30%',
  },
  perMonth: '{price} €/mes',
  perYear: '{price} €/any',
  currentPlan: 'El teu pla actual',
  canceledPlan: 'Subscripció cancel·lada',
  cancel: 'Cancel·la la subscripció',
  cancelFailed: 'No s’ha pogut cancel·lar la subscripció',
  successIcon: 'Inclòs',
  legacyPro: 'Tens una subscripció Pro antiga. És independent del futur Pro de pagament únic i no s’ha migrat automàticament.',
  creator: {
    description: 'Escriu, prova i comparteix amb totes les funcions actuals de l’editor incloses. Subscripció mensual o anual.',
    included: 'Què inclou Creator',
    everything: 'Sense bloquejos de funcions a l’editor:',
    stories: 'Crea i organitza històries amb branques',
    images: 'Afegeix imatges a les escenes',
    brand: 'Personalitza la marca i el peu de la història',
    sharing: 'Enllaços de lectura, botons per compartir i enllaços externs',
    analytics: 'Seguiment de jugadors i analítiques de la història',
    data: 'Descarrega les dades de la història en JSON',
    choose: 'Tria Creator',
  },
  pro: {
    referencePrice: 'Uns {price} €',
    oneTime: 'Pagament únic · previst',
    description: 'Un futur pagament únic amb exportació d’històries. Encara no es pot comprar.',
    export: 'Exportació jugable prevista, encara no implementada',
    format: 'El format i l’abast de l’exportació encara s’han de decidir',
    priceNote: 'Preu orientatiu, no és una oferta definitiva. No es cobra cap pagament per Pro.',
    comingSoon: 'Pro encara no està disponible',
  },
}
