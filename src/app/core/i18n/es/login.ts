import type { Dictionary } from '../i18n.types'

export const login: Dictionary['login'] = {
  home: 'Inicio de Trama',
  eyebrow: 'TU HISTORIA EMPIEZA AQUÍ',
  titleStart: 'Hay una historia que solo',
  titleEnd: 'tú puedes contar.',
  intro:
    'Dale un lugar donde empezar. Escríbela, deja que tus lectores encuentren su propio camino y compártela cuando quieras.',
  note: 'Creative · Gratis · Todas las funciones actuales del editor incluidas',
  checkout: {
    continue: 'Inicia sesión o crea una cuenta para continuar al pago seguro con Stripe. La suscripción solo empieza cuando se confirma el pago.',
    unavailable: 'Este pago no está disponible. Pro está previsto como un pago único y aún no se puede comprar. Los antiguos enlaces de suscripción Pro ya no se ofrecen.',
    viewPlans: 'Consulta los planes actuales',
    authError: 'No se ha podido iniciar sesión o crear la cuenta. Revisa los datos e inténtalo de nuevo.',
  },
  back: '← Volver a Trama',
  or: 'o',
  google: {
    logo: 'Logotipo de Google',
    register: 'Regístrate con Google',
    login: 'Inicia sesión con Google',
  },
  register: {
    title: 'Crea tu cuenta',
    subtitle: 'Crea una cuenta para tus historias. Es gratis.',
    username: 'Nombre de usuario',
    email: 'Tu correo electrónico',
    password: 'Nueva contraseña',
    submit: 'Registrarse',
    hasAccount: '¿Ya tienes una cuenta?',
    legal: {
      start: 'Al registrarte aceptas las',
      terms: 'Condiciones de servicio',
      and: 'y la',
      privacy: 'Política de privacidad',
    },
  },
  signIn: {
    title: 'Hola de nuevo',
    email: 'Tu correo electrónico',
    password: 'Tu contraseña',
    forgot: '¿Has olvidado la contraseña?',
    submit: 'Iniciar sesión',
    noAccount: '¿No tienes una cuenta?',
  },
  feedback: {
    emailNotConfirmed: 'Todavía no has confirmado tu correo. Abre el enlace que te enviamos o vuelve a enviarlo.',
    emailAlreadyRegistered: 'Este correo ya tiene una cuenta. Inicia sesión con él.',
  },
  validation: {
    required: 'Rellena este campo.',
    email: 'Este correo no parece correcto. Revísalo.',
    passwordHint: 'Al menos {min} caracteres.',
    passwordLength: 'Usa al menos {min} caracteres.',
    passwordWeak: 'Esta contraseña es demasiado fácil de adivinar. Hazla más larga y mezcla letras, números y símbolos.',
  },
  confirm: {
    title: 'Revisa tu correo',
    text: 'Hemos enviado un enlace a {email}. Ábrelo para confirmar la cuenta y empezar a escribir.',
    textCheckout: 'Hemos enviado un enlace a {email}. Ábrelo para confirmar la cuenta y continuar al pago.',
    resend: 'Volver a enviarlo',
    sent: 'Enviado de nuevo. Puede tardar unos minutos; mira también en la carpeta de spam.',
    resendError: 'No se ha podido volver a enviar. Espera un minuto e inténtalo de nuevo.',
    otherEmail: 'Usar otro correo',
  },
  signedIn: {
    title: 'Ya has iniciado sesión',
    text: 'Has iniciado sesión como {email}.',
    continuePayment: 'Continuar al pago',
    stories: 'Ir a mis historias',
    signOut: 'Usar otra cuenta',
  },
  reset: {
    title: 'Restablece tu contraseña',
    description:
      'Introduce el correo electrónico verificado de tu cuenta y te enviaremos un enlace para restablecer la contraseña',
    email: 'Tu correo electrónico',
    submit: 'Enviar correo de restablecimiento',
    success: 'Te hemos enviado el enlace por correo electrónico',
    error:
      'Ha habido un error al enviar el enlace. Inténtalo de nuevo más tarde',
  },
  change: {
    title: 'Crea una contraseña nueva',
    password: 'Tu nueva contraseña',
    repeat: 'Repite tu nueva contraseña',
    mismatch: 'Las contraseñas no coinciden',
    dashboard: 'Ir al panel',
    submit: 'Guardar la nueva contraseña',
    success: 'Tu contraseña se ha cambiado correctamente',
    error:
      'No se ha podido actualizar tu contraseña. Inténtalo de nuevo más tarde.',
    notEqual: 'La contraseña y su repetición deben ser iguales',
  },
}
