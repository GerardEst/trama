import type { Dictionary } from '../i18n.types'

export const settings: Dictionary['settings'] = {
  title: 'Configuració',
  navLabel: 'Configuració',
  account: {
    nav: 'Compte',
    title: 'Compte',
    subtitle: 'Les teves dades d’accés, les preferències i la sessió. Només les veus tu.',
    identity: 'Les teves dades',
    nameHint: 'Els lectors veuen el nom del teu perfil de creador, no aquest.',
    security: 'Accés',
    password: 'Contrasenya',
    passwordHint: 'Tria una contrasenya nova per entrar amb el teu correu.',
    providerHint: 'Entres amb {provider}, que guarda la teva contrasenya.',
    session: 'Sessió',
    sessionHint: 'Tanca la sessió en aquest dispositiu.',
  },
  preferences: {
    nav: 'Preferències',
    title: 'Preferències',
    subtitle: 'Com es veu Trama i com et parla en aquest dispositiu.',
    nightModeHint: 'Colors foscos a tot Trama.',
    helpHint: 'Els petits botons ? que expliquen cada part de l’editor.',
    languageHint: 'L’idioma de Trama, no el de les teves històries.',
  },
  billing: {
    nav: 'Pla i facturació',
    title: 'Pla i facturació',
    subtitle: 'El teu pla, la subscripció i quan toca el proper pagament.',
    yourPlan: 'El teu pla',
    active: 'Actiu',
    noPlan: 'Sense subscripció',
    creator: 'Creative',
    legacyPro: 'Pro (antic)',
    none: 'Cap pla',
  },
  menu: {
    open: '{name}, menú del compte',
    account: 'Compte',
    billing: 'Pla i facturació',
    guide: 'Guia',
  },
}
