import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { RouteLoading } from '@/components/common/RouteLoading'
import { useAuthStore } from '@/store'

export const Route = createFileRoute('/_public')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  pendingComponent: RouteLoading,
  component: () => <Outlet />,
})
