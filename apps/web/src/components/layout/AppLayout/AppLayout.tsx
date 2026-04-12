import { Outlet } from '@tanstack/react-router'

import { Header } from './components/Header'

export const AppLayout = () => (
  <div className="flex min-h-svh flex-col">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
)
