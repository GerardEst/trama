import { TranslationKey } from 'src/app/core/i18n/i18n.types'

export const LOGIN_FEEDBACKS = {
  EMAIL_NOT_CONFIRMED: 'login.feedback.emailNotConfirmed',
  CONFIRM_EMAIL: 'login.feedback.confirmEmail',
  EMAIL_ALREADY_REGISTERED: 'login.feedback.emailAlreadyRegistered',
} as const satisfies Record<string, TranslationKey>
