export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT

export const isDevelopment = ENVIRONMENT === 'development'
export const isProduction = ENVIRONMENT === 'production'
