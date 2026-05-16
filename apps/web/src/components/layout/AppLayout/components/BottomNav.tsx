import {
  ChartBarLineIcon,
  CreditCardIcon,
  Home01Icon,
  Invoice01Icon,
  Settings01Icon,
  ShieldUserIcon,
  Tag01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { cn } from '@workspace/ui/lib/utils'
import { Fragment, useState } from 'react'

const NAV_ITEMS = [
  { to: '/' as const, label: 'Dashboard', icon: Home01Icon },
  { to: '/transactions' as const, label: 'Lançamentos', icon: Invoice01Icon },
  { to: '/reports' as const, label: 'Relatórios', icon: ChartBarLineIcon },
]

const SETTINGS_ITEMS = [
  { to: '/profile' as const, label: 'Meu Perfil', icon: ShieldUserIcon },
  { to: '/settings/accounts' as const, label: 'Contas', icon: CreditCardIcon },
  {
    to: '/settings/categories' as const,
    label: 'Categorias',
    icon: Tag01Icon,
  },
]

export const BottomNav = () => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { pathname } = useLocation()

  const isSettingsActive =
    pathname === '/profile' || pathname.startsWith('/settings')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex transform-gpu flex-col border-t bg-background/60 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl sm:hidden">
      <div className="flex h-18 w-full shrink-0 touch-manipulation items-center justify-around">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors active:bg-foreground/6"
            activeProps={{
              className: 'text-primary',
            }}
          >
            <HugeiconsIcon icon={icon} className="size-5" />
            <span className="text-[0.625rem] leading-tight">{label}</span>
          </Link>
        ))}

        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger
            render={
              <button
                className={cn(
                  'flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors active:bg-foreground/6',
                  isSettingsActive && 'text-primary'
                )}
              />
            }
          >
            <HugeiconsIcon icon={Settings01Icon} className="size-5" />
            <span className="text-[0.625rem] leading-tight">Configurações</span>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            sideOffset={12}
            align="end"
            className="w-48 gap-1 rounded-xl p-1"
          >
            {SETTINGS_ITEMS.map(({ to, label, icon }) => (
              <Fragment key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  activeProps={{
                    className: 'bg-accent text-foreground font-medium',
                  }}
                  onClick={() => setSettingsOpen(false)}
                >
                  <HugeiconsIcon icon={icon} className="size-4" />
                  {label}
                </Link>
              </Fragment>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  )
}
