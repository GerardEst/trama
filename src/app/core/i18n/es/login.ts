import type { Dictionary } from '../i18n.types'

export const login: Dictionary['login'] = {
  home: 'Inicio de Trama',
  eyebrow: 'TU HISTORIA EMPIEZA AQUÍ',
  titleStart: 'Hay una historia que solo',
  titleEnd: 'tú puedes contar.',
  intro:
    'Dale un lugar donde empezar. Escríbela, deja que tus lectores encuentren su propio camino y compártela cuando quieras.',
  note: 'Plan gratuito disponible · Sin tarjeta de crédito',
  back: '← Volver a Trama',
  or: 'o',
  google: {
    logo: 'Logotipo de Google',
    register: 'Regístrate con Google',
    login: 'Inicia sesión con Google',
  },
  register: {
    title: 'Crea tu cuenta',
    subtitle: 'Empieza a crear tu primera historia gratis.',
    username: 'Nombre de usuario',
    email: 'Tu correo electrónico',
    password: 'Nueva contraseña',
    submit: 'Registrarse',
    hasAccount: '¿Ya tienes una cuenta?',
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
    emailNotConfirmed:
      'Todavía no has confirmado tu correo electrónico. Revisa tu bandeja de entrada. <br><br>Si ha pasado más de una hora desde que te registraste, escríbenos a gesteve.12@gmail.com',
    confirmEmail:
      'Revisa tu bandeja de entrada para <strong>confirmar tu correo electrónico</strong>',
    emailAlreadyRegistered:
      'Este correo electrónico ya está registrado. Pulsa el botón de iniciar sesión para entrar',
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
