import { createFileRoute } from '@tanstack/react-router'
import { Fragment } from 'react'

import { useLogout } from '@/api/auth'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  const logout = useLogout()

  return (
    <Fragment>
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Welcome to FinFlow</h1>
          <p className="text-muted-foreground">You are authenticated.</p>
          <button
            onClick={() => logout.mutate(undefined)}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </Fragment>
  )
}
