import type { AnyRouter } from '@tanstack/react-router'

export type MonitoringConfig = {
  dsn: string
  environment: string
  enabled: boolean
  tracesSampleRate: number
  replaysSessionSampleRate: number
  replaysOnErrorSampleRate: number
}

export type MonitoringUser = {
  id: string
  email?: string
  name?: string
}

export type Monitoring = {
  init: (config: MonitoringConfig, router: AnyRouter) => void
  captureException: (error: unknown) => void
  captureMessage: (message: string) => void
  setUser: (user: MonitoringUser) => void
  clearUser: () => void
}
