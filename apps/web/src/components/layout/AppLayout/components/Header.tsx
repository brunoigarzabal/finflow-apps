import { Menu01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { useState } from 'react'

import { AppLogo } from '@/components/common/AppLogo'

import { MobileNav } from './MobileNav'
import { SettingsMenu } from './SettingsMenu'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

export const Header = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="scroll-edge-top pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3">
      <div className="pointer-events-auto mx-auto flex h-14 w-full max-w-7xl items-center justify-between rounded-full glass px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden sm:flex md:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
            <span className="sr-only">Menu</span>
          </Button>

          <Link
            to="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight"
          >
            <AppLogo />
            Minhas Finanças
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className: 'bg-foreground/8 text-foreground font-medium',
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className: 'bg-foreground/8 text-foreground font-medium',
              }}
            >
              Lançamentos
            </Link>
            <Link
              to="/reports"
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className: 'bg-foreground/8 text-foreground font-medium',
              }}
            >
              Relatórios
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="hidden md:block">
            <SettingsMenu />
          </div>
          <UserMenu />
        </div>
      </div>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </header>
  )
}
