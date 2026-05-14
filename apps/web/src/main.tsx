/* eslint-disable react-refresh/only-export-components */
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

import '@workspace/ui/globals.css'

import { ENVIRONMENT, SENTRY_DSN, isProduction } from './config/env'
import { monitoring } from './lib/monitoring'
import { queryClient } from './lib/react-query'
import { GlobalProvider } from './providers'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  basepath: '/',
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadDelay: 100,
})

monitoring.init(
  {
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT ?? 'development',
    enabled: Boolean(SENTRY_DSN),
    tracesSampleRate: isProduction ? 0.2 : 1.0,
    replaysSessionSampleRate: isProduction ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
  },
  router
)

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const InnerApp = () => {
  useRegisterSW({
    onNeedRefresh() {
      toast.info('Nova versão disponível. Recarregue a página para atualizar.')
    },
    onOfflineReady() {
      toast.success('Modo offline pronto.')
    },
  })

  return <RouterProvider router={router} context={{ queryClient }} />
}

const App = () => (
  <GlobalProvider queryClient={queryClient}>
    <InnerApp />
  </GlobalProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
