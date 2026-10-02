import type { Dictionary } from '../i18n.types'

export const login: Dictionary['login'] = {
  home: 'Inici de Trama',
  eyebrow: 'LA TEVA HISTÒRIA COMENÇA AQUÍ',
  titleStart: 'Hi ha una història que només',
  titleEnd: 'tu pots explicar.',
  intro:
    'Dona-li un lloc on començar. Escriu-la, deixa que els teus lectors hi trobin el seu propi camí i comparteix-la quan estiguis a punt.',
  note: 'Pla gratuït disponible · Sense targeta de crèdit',
  back: '← Torna a Trama',
  or: 'o',
  google: {
    logo: 'Logotip de Google',
    register: 'Registra’t amb Google',
    login: 'Inicia sessió amb Google',
  },
  register: {
    title: 'Crea el teu compte',
    subtitle: 'Comença a crear la teva primera història gratis.',
    username: 'Nom d’usuari',
    email: 'El teu correu electrònic',
    password: 'Contrasenya nova',
    submit: 'Registra’t',
    hasAccount: 'Ja tens un compte?',
  },
  signIn: {
    title: 'Hola de nou',
    email: 'El teu correu electrònic',
    password: 'La teva contrasenya',
    forgot: 'Has oblidat la contrasenya?',
    submit: 'Inicia sessió',
    noAccount: 'No tens cap compte?',
  },
  feedback: {
    emailNotConfirmed:
      'Encara no has confirmat el teu correu electrònic. Revisa la safata d’entrada. <br><br>Si ha passat més d’una hora des que et vas registrar, escriu-nos a gesteve.12@gmail.com',
    confirmEmail:
      'Revisa la safata d’entrada per <strong>confirmar el teu correu electrònic</strong>',
    emailAlreadyRegistered:
      'Aquest correu electrònic ja està registrat. Prem el botó d’iniciar sessió per entrar',
  },
  reset: {
    title: 'Restableix la contrasenya',
    description:
      'Introdueix el correu electrònic verificat del teu compte i t’enviarem un enllaç per restablir la contrasenya',
    email: 'El teu correu electrònic',
    submit: 'Envia el correu de restabliment',
    success: 'T’hem enviat l’enllaç per correu electrònic',
    error:
      'Hi ha hagut un error en enviar l’enllaç. Torna-ho a provar més tard',
  },
  change: {
    title: 'Crea una contrasenya nova',
    password: 'La teva contrasenya nova',
    repeat: 'Repeteix la contrasenya nova',
    mismatch: 'Les contrasenyes no coincideixen',
    dashboard: 'Ves al panell',
    submit: 'Desa la contrasenya nova',
    success: 'La contrasenya s’ha canviat correctament',
    error:
      'No s’ha pogut actualitzar la contrasenya. Torna-ho a provar més tard.',
    notEqual: 'La contrasenya i la repetició han de ser iguals',
  },
}
