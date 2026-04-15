import { Outlet } from '@tanstack/react-router'

import { Header } from './components/Header'

export const AppLayout = () => (
  <div className="flex min-h-svh flex-col">
    <Header />
    <main className="flex-1">
      <div className="mx-auto w-full max-w-7xl">
        <Outlet />
      </div>
    </main>
  </div>
)
