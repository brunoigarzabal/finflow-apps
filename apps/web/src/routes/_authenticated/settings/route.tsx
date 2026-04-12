import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { Fragment } from 'react'

export const Route = createFileRoute('/_authenticated/settings')({
  beforeLoad: ({ location }) => {
    if (
      location.pathname === '/settings' ||
      location.pathname === '/settings/'
    ) {
      throw redirect({ to: '/settings/accounts' })
    }
  },
  component: SettingsLayout,
})

function SettingsLayout() {
  return (
    <Fragment>
      <div className="hidden min-h-[calc(100svh-3.5rem)] md:flex">
        <aside className="w-56 border-r p-4">
          <nav className="flex flex-col gap-1">
            <Link
              to="/settings/accounts"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground"
              activeProps={{
                className: 'text-foreground font-medium bg-accent',
              }}
            >
              Contas
            </Link>
            <Link
              to="/settings/categories"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground"
              activeProps={{
                className: 'text-foreground font-medium bg-accent',
              }}
            >
              Categorias
            </Link>
          </nav>
        </aside>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex border-b">
          <Link
            to="/settings/accounts"
            className="flex-1 py-3 text-center text-sm text-muted-foreground"
            activeProps={{
              className:
                'text-foreground font-medium border-b-2 border-primary',
            }}
          >
            Contas
          </Link>
          <Link
            to="/settings/categories"
            className="flex-1 py-3 text-center text-sm text-muted-foreground"
            activeProps={{
              className:
                'text-foreground font-medium border-b-2 border-primary',
            }}
          >
            Categorias
          </Link>
        </div>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </Fragment>
  )
}
