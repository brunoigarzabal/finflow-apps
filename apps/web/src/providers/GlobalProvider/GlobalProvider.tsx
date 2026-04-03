import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ThemeProvider } from '@/components/theme-provider'

type GlobalProviderProps = Readonly<{
  children: ReactNode
  queryClient: QueryClient
}>

export const GlobalProvider = ({
  children,
  queryClient,
}: GlobalProviderProps) => (
  <ThemeProvider defaultTheme="light" storageKey="@finflow/theme">
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </ThemeProvider>
)
