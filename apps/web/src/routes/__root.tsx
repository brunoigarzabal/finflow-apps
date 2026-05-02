import {
  HeadContent,
  createRootRouteWithContext,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { Fragment } from 'react'

import { RouteLoading } from '@/components/common/RouteLoading'
import type { RouterContext } from '@/types/router.types'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: 'Minhas Finanças',
      },
    ],
  }),
  pendingComponent: RouteLoading,
  component: RootComponent,
})

function RootComponent() {
  return (
    <Fragment>
      <HeadContent />
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
      <TanStackRouterDevtools position="bottom-right" />
    </Fragment>
  )
}
