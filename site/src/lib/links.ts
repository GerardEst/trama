// Links from the site into the app. The app is served from the same origin.

export const APP_LINKS = {
  login: '/login',
  dashboard: '/dashboard',
  register: '/login?mode=register&plan=creator&period=monthly',
  email: 'mailto:gesteve.12@gmail.com',
} as const

export const ENGINE_LINKS = {
  npm: 'https://www.npmjs.com/package/@trama-app/engine',
  source: 'https://github.com/GerardEst/trama/tree/main/packages/engine',
} as const

/** Supabase keeps the session in localStorage under this key (see the app's DatabaseService). */
export const SESSION_STORAGE_KEY = 'sb-lsemostpqoguehpsbzgu-auth-token'

/** Shared with the app: the reader's chosen language and theme. */
export const LANG_STORAGE_KEY = 'polo-lang'
export const THEME_STORAGE_KEY = 'polo-theme'
