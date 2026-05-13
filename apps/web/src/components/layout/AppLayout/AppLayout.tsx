import { Outlet, useLocation } from '@tanstack/react-router'
import { ScrollArea } from '@workspace/ui/components/scroll-area'

import { BottomNav } from './components/BottomNav'
import { Header } from './components/Header'

export const AppLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex h-svh flex-col">
      <Header />
      <ScrollArea key={pathname} className="flex-1 overflow-hidden">
        <main className="h-full pt-14 pb-16 sm:pb-0">
          <div className="mx-auto h-full w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </ScrollArea>
      <BottomNav />
    </div>
  )
}
