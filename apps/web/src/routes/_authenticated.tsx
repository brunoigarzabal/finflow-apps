import { createFileRoute, redirect } from '@tanstack/react-router'

import { RouteLoading } from '@/components/common/RouteLoading'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuthStore } from '@/store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  pendingComponent: RouteLoading,
  component: AppLayout,
})
