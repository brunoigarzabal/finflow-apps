import { Outlet, useLocation } from '@tanstack/react-router'
import { ScrollArea } from '@workspace/ui/components/scroll-area'

import { Header } from './components/Header'

export const AppLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex h-svh flex-col">
      <Header />
      <ScrollArea key={pathname} className="flex-1 overflow-hidden">
        <main className="h-full">
          <div className="mx-auto h-full w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </ScrollArea>
    </div>
  )
}
