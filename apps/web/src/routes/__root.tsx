import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Fragment } from 'react'

import { RouteLoading } from '@/components/common/RouteLoading'
import type { RouterContext } from '@/types/router.types'

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: RouteLoading,
  component: RootComponent,
})

function RootComponent() {
  return (
    <Fragment>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </Fragment>
  )
}
