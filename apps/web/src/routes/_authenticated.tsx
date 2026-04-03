import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { RouteLoading } from '@/components/common/RouteLoading'
import { useAuthStore } from '@/store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  pendingComponent: RouteLoading,
  component: () => <Outlet />,
})
