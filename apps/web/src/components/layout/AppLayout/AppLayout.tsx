import { Outlet, useLocation } from '@tanstack/react-router'
import { ScrollArea } from '@workspace/ui/components/scroll-area'

import { BottomNav } from './components/BottomNav'
import { Header } from './components/Header'

export const AppLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <ScrollArea key={pathname} className="min-h-0 flex-1 overflow-hidden">
        <main className="min-h-full pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
          <div className="mx-auto min-h-full w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </ScrollArea>
      <BottomNav />
    </div>
  )
}
