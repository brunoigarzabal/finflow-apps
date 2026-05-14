import * as Sentry from '@sentry/react'

import type { Monitoring, MonitoringUser } from './types'

const init: Monitoring['init'] = (config, router) => {
  if (!config.enabled) return

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    integrations: [
      Sentry.tanstackRouterBrowserTracingIntegration(router),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: config.tracesSampleRate,
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
  })
}

const captureException = (error: unknown) => {
  Sentry.captureException(error)
}

const captureMessage = (message: string) => {
  Sentry.captureMessage(message)
}

const setUser = (user: MonitoringUser) => {
  Sentry.setUser(user)
}

const clearUser = () => {
  Sentry.setUser(null)
}

export const sentry: Monitoring = {
  init,
  captureException,
  captureMessage,
  setUser,
  clearUser,
}
