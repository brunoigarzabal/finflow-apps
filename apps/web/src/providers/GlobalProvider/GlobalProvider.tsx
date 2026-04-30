import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { Toaster } from '@workspace/ui/components/sonner'
import type { ReactNode } from 'react'

import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { GOOGLE_CLIENT_ID } from '@/config/env'

type GlobalProviderProps = Readonly<{
  children: ReactNode
  queryClient: QueryClient
}>

const ThemedToaster = () => {
  const { theme } = useTheme()
  const resolved = theme === 'system' ? undefined : theme

  return <Toaster richColors theme={resolved} position="top-right" />
}

export const GlobalProvider = ({
  children,
  queryClient,
}: GlobalProviderProps) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ThemeProvider defaultTheme="light" storageKey="@finflow/theme">
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
)
