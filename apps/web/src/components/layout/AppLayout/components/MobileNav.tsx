import { Link } from '@tanstack/react-router'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const MobileNav = ({ open, onOpenChange }: Props) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="left">
      <SheetHeader>
        <SheetTitle>FinFlow</SheetTitle>
      </SheetHeader>
      <nav className="mt-4 flex flex-col gap-1 px-2">
        <Link
          to="/"
          className="rounded-md px-3 py-2 text-sm text-muted-foreground"
          activeProps={{ className: 'text-foreground font-medium bg-accent' }}
          onClick={() => onOpenChange(false)}
        >
          Dashboard
        </Link>
        <Link
          to="/transactions"
          className="rounded-md px-3 py-2 text-sm text-muted-foreground"
          activeProps={{ className: 'text-foreground font-medium bg-accent' }}
          onClick={() => onOpenChange(false)}
        >
          Lançamentos
        </Link>
        <Link
          to="/reports"
          className="rounded-md px-3 py-2 text-sm text-muted-foreground"
          activeProps={{ className: 'text-foreground font-medium bg-accent' }}
          onClick={() => onOpenChange(false)}
        >
          Relatórios
        </Link>
      </nav>
    </SheetContent>
  </Sheet>
)
