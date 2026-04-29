import { Settings01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

export const SettingsMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger
      openOnHover
      aria-haspopup="menu"
      render={
        <button className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground" />
      }
    >
      <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="size-4" />
      <span className="sr-only">Configurações</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" side="bottom">
      <DropdownMenuItem render={<Link to="/settings/accounts" />}>
        Contas
      </DropdownMenuItem>
      <DropdownMenuItem render={<Link to="/settings/categories" />}>
        Categorias
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
