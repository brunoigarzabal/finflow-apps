import { env } from '@/shared/config/env.js'

const isProduction = env.NODE_ENV === 'production'

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
}

export const AUTH_COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
}
