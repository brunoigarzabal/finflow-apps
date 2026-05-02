import {
  ChartBarLineIcon,
  CreditCardIcon,
  Home01Icon,
  Invoice01Icon,
  Tag01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { Separator } from '@workspace/ui/components/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'

import { AppLogo } from '@/components/common/AppLogo'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NAV_ITEMS = [
  { to: '/' as const, label: 'Dashboard', icon: Home01Icon },
  { to: '/transactions' as const, label: 'Lançamentos', icon: Invoice01Icon },
  { to: '/reports' as const, label: 'Relatórios', icon: ChartBarLineIcon },
]

const SETTINGS_ITEMS = [
  { to: '/settings/accounts' as const, label: 'Contas', icon: CreditCardIcon },
  { to: '/settings/categories' as const, label: 'Categorias', icon: Tag01Icon },
]

export const MobileNav = ({ open, onOpenChange }: Props) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="left">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <AppLogo />
          Minhas Finanças
        </SheetTitle>
      </SheetHeader>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{
              className: 'bg-accent text-foreground font-medium',
            }}
            onClick={() => onOpenChange(false)}
          >
            <HugeiconsIcon icon={icon} className="size-5" />
            {label}
          </Link>
        ))}

        <Separator className="my-2" />

        <span className="px-3 py-1 text-xs font-medium tracking-wider text-muted-foreground/60 uppercase">
          Configurações
        </span>

        {SETTINGS_ITEMS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{
              className: 'bg-accent text-foreground font-medium',
            }}
            onClick={() => onOpenChange(false)}
          >
            <HugeiconsIcon icon={icon} className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </SheetContent>
  </Sheet>
)
