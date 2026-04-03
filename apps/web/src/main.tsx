/* eslint-disable react-refresh/only-export-components */
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

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

function InnerApp() {
  return <RouterProvider router={router} context={{ queryClient }} />
}

function App() {
  return (
    <GlobalProvider queryClient={queryClient}>
      <InnerApp />
    </GlobalProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
