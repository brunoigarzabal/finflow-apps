export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? ''

export const isDevelopment = ENVIRONMENT === 'development'
export const isProduction = ENVIRONMENT === 'production'
