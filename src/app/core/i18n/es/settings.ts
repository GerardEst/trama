import type { Dictionary } from '../i18n.types'

export const settings: Dictionary['settings'] = {
  title: 'Ajustes',
  navLabel: 'Ajustes',
  account: {
    nav: 'Cuenta',
    title: 'Cuenta',
    subtitle: 'Tus datos de acceso, las preferencias y la sesión. Solo los ves tú.',
    identity: 'Tus datos',
    nameHint: 'Los lectores ven el nombre de tu perfil de creador, no este.',
    security: 'Acceso',
    password: 'Contraseña',
    passwordHint: 'Elige una contraseña nueva para entrar con tu correo.',
    providerHint: 'Entras con {provider}, que guarda tu contraseña.',
    session: 'Sesión',
    sessionHint: 'Cierra la sesión en este dispositivo.',
  },
  preferences: {
    nav: 'Preferencias',
    title: 'Preferencias',
    subtitle: 'Cómo se ve Trama y cómo te habla en este dispositivo.',
    nightModeHint: 'Colores oscuros en todo Trama.',
    helpHint: 'Los pequeños botones ? que explican cada parte del editor.',
    languageHint: 'El idioma de Trama, no el de tus historias.',
  },
  billing: {
    nav: 'Plan y facturación',
    title: 'Plan y facturación',
    subtitle: 'Tu plan, la suscripción y cuándo toca el próximo pago.',
    yourPlan: 'Tu plan',
    active: 'Activo',
    noPlan: 'Sin suscripción',
    creator: 'Creative',
    legacyPro: 'Pro (antiguo)',
    none: 'Ningún plan',
  },
  menu: {
    open: '{name}, menú de la cuenta',
    account: 'Cuenta',
    billing: 'Plan y facturación',
    guide: 'Guía',
  },
}
