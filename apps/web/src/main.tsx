/* eslint-disable react-refresh/only-export-components */
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

import '@workspace/ui/globals.css'

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
