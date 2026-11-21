import type { Dictionary } from '../i18n.types'

export const login: Dictionary['login'] = {
  home: 'Inici de Trama',
  eyebrow: 'LA TEVA HISTÒRIA COMENÇA AQUÍ',
  titleStart: 'Hi ha una història que només',
  titleEnd: 'tu pots explicar.',
  intro:
    'Dona-li un lloc on començar. Escriu-la, deixa que els teus lectors hi trobin el seu propi camí i comparteix-la quan estiguis a punt.',
  note: 'Creative · Gratis · Totes les funcions actuals de l’editor incloses',
  checkout: {
    continue: 'Inicia sessió o crea un compte per continuar al pagament segur amb Stripe. La subscripció només comença quan es confirma el pagament.',
    unavailable: 'Aquest pagament no està disponible. Pro està previst com un pagament únic i encara no es pot comprar. Els antics enllaços de subscripció Pro ja no s’ofereixen.',
    viewPlans: 'Consulta els plans actuals',
    authError: 'No s’ha pogut iniciar sessió o crear el compte. Revisa les dades i torna-ho a provar.',
  },
  back: '← Torna a Trama',
  or: 'o',
  google: {
    logo: 'Logotip de Google',
    register: 'Registra’t amb Google',
    login: 'Inicia sessió amb Google',
  },
  register: {
    title: 'Crea el teu compte',
    subtitle: 'Crea un compte per a les teves històries. És gratis.',
    username: 'Nom d’usuari',
    email: 'El teu correu electrònic',
    password: 'Contrasenya nova',
    submit: 'Registra’t',
    hasAccount: 'Ja tens un compte?',
    legal: {
      start: 'En registrar-te acceptes les',
      terms: 'Condicions de servei',
      and: 'i la',
      privacy: 'Política de privacitat',
    },
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
    emailNotConfirmed: 'Encara no has confirmat el correu. Obre l’enllaç que t’hem enviat o torna a enviar-lo.',
    emailAlreadyRegistered: 'Aquest correu ja té un compte. Inicia sessió amb ell.',
  },
  validation: {
    required: 'Omple aquest camp.',
    email: 'Aquest correu no sembla correcte. Revisa’l.',
    passwordHint: 'Com a mínim {min} caràcters.',
    passwordLength: 'Fes servir com a mínim {min} caràcters.',
    passwordWeak: 'Aquesta contrasenya és massa fàcil d’endevinar. Fes-la més llarga i barreja lletres, números i símbols.',
  },
  confirm: {
    title: 'Revisa el correu',
    text: 'Hem enviat un enllaç a {email}. Obre’l per confirmar el compte i començar a escriure.',
    textCheckout: 'Hem enviat un enllaç a {email}. Obre’l per confirmar el compte i continuar al pagament.',
    resend: 'Torna a enviar-lo',
    sent: 'Enviat de nou. Pot trigar uns minuts; mira també la carpeta de correu brossa.',
    resendError: 'No s’ha pogut tornar a enviar. Espera un minut i torna-ho a provar.',
    otherEmail: 'Fes servir un altre correu',
  },
  signedIn: {
    title: 'Ja has iniciat sessió',
    text: 'Has iniciat sessió com a {email}.',
    continuePayment: 'Continua al pagament',
    stories: 'Ves a les meves històries',
    signOut: 'Fes servir un altre compte',
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
