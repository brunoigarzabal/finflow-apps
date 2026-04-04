import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ThemeProvider } from '@/components/theme-provider'
import { GOOGLE_CLIENT_ID } from '@/config/env'

type GlobalProviderProps = Readonly<{
  children: ReactNode
  queryClient: QueryClient
}>

export const GlobalProvider = ({
  children,
  queryClient,
}: GlobalProviderProps) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ThemeProvider defaultTheme="light" storageKey="@finflow/theme">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
)
